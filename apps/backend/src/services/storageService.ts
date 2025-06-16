import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

interface IStorageProvider {
  upload(file: Express.Multer.File): Promise<string>;
  delete(fileIdentifier: string): Promise<void>;
  getAccessUrl(fileIdentifier: string): Promise<string>;
}

class BackblazeB2Provider implements IStorageProvider {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    if (!process.env.B2_KEY_ID || !process.env.B2_APP_KEY || !process.env.B2_REGION || !process.env.B2_BUCKET_NAME) {
      throw new Error("Konfigurasi Backblaze B2 tidak lengkap di .env");
    }
    this.client = new S3Client({
      endpoint: `https://s3.${process.env.B2_REGION}.backblazeb2.com`,
      region: process.env.B2_REGION,
      credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APP_KEY,
      },
    });
    this.bucketName = process.env.B2_BUCKET_NAME;
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const fileStream = fs.createReadStream(file.path);
    const key = `letters/${Date.now()}-${path.basename(file.originalname)}`;
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
    }));
    
    fs.unlinkSync(file.path);
    return key;
  }

  async delete(fileIdentifier: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileIdentifier,
    }));
  }

  async getAccessUrl(fileIdentifier: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileIdentifier,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
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
  
  delete(fileIdentifier: string, providerName: 'b2' | 'cloudinary'): Promise<void> {
      return this.getProvider(providerName).delete(fileIdentifier);
  }

  getAccessUrl(fileIdentifier: string, providerName: 'b2' | 'cloudinary'): Promise<string> {
      return this.getProvider(providerName).getAccessUrl(fileIdentifier);
  }
}

export const storageService = new StorageService();
