import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

interface IStorageProvider {
  upload(file: Express.Multer.File): Promise<string>;
  delete(fileIdentifier: string, fileName: string): Promise<void>;
  getAccessUrl(fileName: string): Promise<string>;
}

class BackblazeB2Provider implements IStorageProvider {
  private apiUrl: string = '';
  private authorizationToken: string = '';
  private downloadUrl: string = '';
  private bucketId: string;
  private bucketName: string;

  constructor() {
    if (!process.env.B2_KEY_ID || !process.env.B2_APP_KEY || !process.env.B2_BUCKET_ID) {
      throw new Error("Konfigurasi Backblaze B2 (Credentials & B2_BUCKET_ID) tidak lengkap di .env");
    }
    this.bucketId = process.env.B2_BUCKET_ID!;
    this.bucketName = process.env.B2_BUCKET_NAME!;
  }

  private async authorize(): Promise<void> {
    if (this.authorizationToken) return;

    try {
      const B2_KEY_ID = process.env.B2_KEY_ID!;
      const B2_APP_KEY = process.env.B2_APP_KEY!;
      const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');

      const response = await axios.get('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      this.apiUrl = response.data.apiUrl;
      this.authorizationToken = response.data.authorizationToken;
      this.downloadUrl = response.data.downloadUrl;

    } catch (error) {
      console.error('B2 Authorization Error:', error);
      throw new Error('Gagal melakukan otorisasi dengan Backblaze B2.');
    }
  }

  async upload(file: Express.Multer.File): Promise<string> {
    await this.authorize();

    const getUploadUrlResponse = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
      { bucketId: this.bucketId },
      { headers: { Authorization: this.authorizationToken } }
    );

    const { uploadUrl, authorizationToken: uploadAuthToken } = getUploadUrlResponse.data;

    const fileData = fs.readFileSync(file.path);
    const sha1 = crypto.createHash('sha1').update(fileData).digest('hex');
    const fileName = `letters/${Date.now()}-${encodeURIComponent(path.basename(file.originalname))}`;

    const uploadResponse = await axios.post(uploadUrl, fileData, {
      headers: {
        'Authorization': uploadAuthToken,
        'X-Bz-File-Name': fileName,
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
        'X-Bz-Content-Sha1': sha1,
      },
    });

    fs.unlinkSync(file.path);

    const { fileId, fileName: returnedFileName } = uploadResponse.data;
    return JSON.stringify({ fileId, fileName: returnedFileName });
  }

  async delete(fileIdentifier: string, fileName?: string): Promise<void> {
    await this.authorize();

    let fileIdToDelete: string | undefined;
    let fileNameToDelete: string | undefined;

    try {
      const parsed = JSON.parse(fileIdentifier);
      fileIdToDelete = parsed.fileId;
      fileNameToDelete = parsed.fileName;
    } catch (e) {
      console.warn('Failed to parse fileIdentifier for B2 delete, assuming legacy fileName:', fileIdentifier);
      fileIdToDelete = undefined;
      fileNameToDelete = fileIdentifier;
    }

    if (!fileIdToDelete) {
      console.warn('fileId missing for Backblaze B2 delete operation. Delete skipped for file:', fileNameToDelete);
      return;
    }

    if (!fileNameToDelete) {
      throw new Error('fileName missing for Backblaze B2 delete operation.');
    }

    try {
      await axios.post(
        `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          fileId: fileIdToDelete,
          fileName: fileNameToDelete,
        },
        {
          headers: {
            Authorization: this.authorizationToken,
          },
        }
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        // @ts-ignore
        console.error('B2 Delete Error:', error.response?.data);
      } else {
        console.error('B2 Delete Error:', error);
      }
      throw new Error('Gagal menghapus file di Backblaze B2.');
    }
  }

  async getAccessUrl(fileName: string): Promise<string> {
    await this.authorize();
    
    const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_get_download_authorization`,
        {
            bucketId: this.bucketId,
            fileNamePrefix: fileName,
            validDurationInSeconds: 3600
        },
        {
            headers: { Authorization: this.authorizationToken }
        }
    );

    const downloadAuthToken = response.data.authorizationToken;
    const friendlyUrl = `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
    
    return `${friendlyUrl}?Authorization=${downloadAuthToken}`;
  }
}

class CloudinaryProvider implements IStorageProvider {
  async upload(file: Express.Multer.File): Promise<string> {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "sipas_gallery"
    });
    fs.unlinkSync(file.path);
    return result.public_id;
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async getAccessUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId);
  }
}

class StorageService {
  private providers: Map<string, IStorageProvider> = new Map();

  constructor() {
    this.providers.set('b2', new BackblazeB2Provider());
    this.providers.set('cloudinary', new CloudinaryProvider());
  }

  private getProvider(providerName: 'b2' | 'cloudinary'): IStorageProvider {
      const provider = this.providers.get(providerName);
      if (!provider) throw new Error(`Storage provider '${providerName}' not configured.`);
      return provider;
  }

  upload(file: Express.Multer.File, providerName: 'b2' | 'cloudinary'): Promise<string> {
      return this.getProvider(providerName).upload(file);
  }
  
  delete(fileIdentifier: string, providerName: 'b2' | 'cloudinary', fileName?: string): Promise<void> {
      // @ts-ignore
      return this.getProvider(providerName).delete(fileIdentifier, fileName);
  }

  getAccessUrl(fileIdentifier: string, providerName: 'b2' | 'cloudinary'): Promise<string> {
      return this.getProvider(providerName).getAccessUrl(fileIdentifier);
  }
}

export const storageService = new StorageService();