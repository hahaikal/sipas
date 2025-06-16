// import { Resend } from 'resend';

export const emailService = {
  async sendOtpEmail(to: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      // ===== BLOK PRODUKSI =====
      // Logika Resend
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // try {
      //   await resend.emails.send({
      //     from: 'SIPAS <no-reply@yourdomain.com>',
      //     to: to,
      //     subject: `Kode Verifikasi SIPAS Anda`,
      //     html: `
      //       <div style="font-family: sans-serif;">
      //         <h2>Verifikasi Akun SIPAS Anda</h2>
      //         <p>Gunakan kode berikut untuk menyelesaikan pendaftaran:</p>
      //         <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
      //         <p>Kode ini hanya berlaku selama 5 menit.</p>
      //       </div>
      //     `
      //   });
      //   console.log(`(PRODUCTION) Email OTP sent to ${to}`);
      // } catch (error) {
      //   console.error("Gagal mengirim email OTP:", error);
      // }
      console.log(`(SIMULASI PRODUKSI) Seharusnya mengirim email OTP ke ${to}`);
    } else {
      // ===== BLOK DEVELOPMENT =====
      console.log("==============================");
      console.log(`EMAIL-DEV: OTP untuk ${to} adalah: ${otp}`);
      console.log("==============================");
    }
  }
};