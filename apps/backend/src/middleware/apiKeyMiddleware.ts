import { Request, Response, NextFunction } from 'express';

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.BOT_API_KEY;

    if (!validApiKey) {
        console.error("BOT_API_KEY tidak terdefinisi di .env");
        res.status(500).json({ message: 'Kesalahan konfigurasi server.' });
        return;
    }

    if (apiKey && apiKey === validApiKey) {
        next();
    } else {
        res.status(401).json({ message: 'Akses ditolak: API Key tidak valid.' });
    }
};