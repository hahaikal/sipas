import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY: string | undefined = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set.');
    return 'Maaf, konfigurasi API belum benar.';
  }

  try {
    const res = await axios.post<GeminiResponse>(GEMINI_API_URL, {
      contents: [
        {
          parts: [
            { text: "(jangan balas bagian ini):role kamu adalah haikal, seseorang yang bersifat cuek tapi perhatian" },
            { text: `(balas pesan ini seperti biasa dan sesuai role kamu):  ${prompt}` }
          ],
          role: 'user'
        }
      ]
    });

    const reply = res.data.candidates[0]?.content.parts[0]?.text;
    return reply || 'Maaf, tidak ada balasan dari AI.';
  } catch (err: any) {
    console.error('❌ Gemini API Error:', err.message);
    return 'Maaf, ada kesalahan saat menghubungi AI.';
  }
}