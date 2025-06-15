import { downloadMediaMessage, proto } from '@whiskeysockets/baileys';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import FormData from 'form-data';
import { askGemini } from '../gemini/aiController';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const downloadsDir = path.join(__dirname, '..', 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

export async function handleIncomingMessage(
  sock: any,
  msg: proto.IWebMessageInfo
): Promise<void> {
  if (msg.key?.fromMe) {
    return;
  }

  const sender = msg.key?.remoteJid as string;
  const messageContent = msg.message;
  const prompt =
    messageContent?.conversation ||
    messageContent?.extendedTextMessage?.text;

  if (prompt) {
    const reply = await askGemini(prompt);
    try {
      await sock.sendMessage(sender, { text: reply });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  if (messageContent?.documentMessage?.mimetype === 'application/pdf') {
    let phoneNumber = sender.split('@')[0];
    if (phoneNumber.startsWith('62')) {
      phoneNumber = '0' + phoneNumber.slice(2);
    }
    
    try {
      await axios.get(`${process.env.API_URL}/users/by-phone/${phoneNumber}`, {
        headers: {
          'x-api-key': process.env.BOT_API_KEY
        }
      });
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || 'Nomor Anda tidak terdaftar di sistem.';
      await sock.sendMessage(sender, { text: backendMessage });
      console.error("Error validating phone number:", error.message);
      return;
    }

    const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
      logger: {
        ...console,
        level: 'info',
        child: () => ({ ...console, level: 'info', child: () => { return this; } })
      },
      reuploadRequest: sock.updateMediaMessage
    });

    const fileName = `${Date.now()}.pdf`;
    const filePath = path.join(downloadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const data = await pdfParse(buffer);
    const textFromPDF = data.text;

    const reply = await askGemini(
      `Beritahu saya hanya nomorSurat, judul dan tanggal surat dari pdf ini. formatnya hanya \n Nomor: (hanya nomor yang didapat)\n Judul: (jika tidak yakin isi not Found) \n Tanggal: (hanya tanggal, contoh: 1 januari 2025)\n\n${textFromPDF}`
    );
    const judulMatch = reply.match(/Judul:\s*(.*)/i);
    const nomorMatch = reply.match(/Nomor:\s*(.*)/i);
    const tanggalMatch = reply.match(/Tanggal:\s*(.*)/i);

    const judul = judulMatch ? judulMatch[1].trim() : 'Tidak ditemukan';
    const nomor = nomorMatch ? nomorMatch[1].trim() : 'Tidak ditemukan';
    const tanggal = tanggalMatch ? tanggalMatch[1].trim() : 'Tidak ditemukan';

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('nomorSurat', nomor);
    formData.append('tanggalSurat', tanggal);
    formData.append('userPhone', phoneNumber);
    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await axios.post(
        `${process.env.API_URL}/letters/bot-upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'x-api-key': process.env.BOT_API_KEY,
          }
        }
      );

      if (response.status === 201) {
        const judulRes = response.data.data?.judul || 'Judul tidak tersedia';
        const nomorSuratRes = response.data.data?.nomorSurat || 'Nomor Surat tidak tersedia';
        const messageToSend = `${response.data.message}\nJudul: ${judulRes}\nNomor Surat: ${nomorSuratRes}`;
        await sock.sendMessage(sender, { text: messageToSend });
      } else {
        await sock.sendMessage(sender, { text: `Gagal mengirim file: ${response.statusText}` });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal mengirim file ke server.';
      await sock.sendMessage(sender, { text: errorMessage });
      if (error.response) {
        console.error('Error uploading file to API:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received from API:', error.request);
      } else {
        console.error('Error setting up request to API:', error.message);
      }
    } finally {
        fs.unlinkSync(filePath);
    }
  }
}