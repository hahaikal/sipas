const crypto = require('crypto');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function testConnection() {
  console.log('Starting WhatsApp connection test...');

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  console.log('Auth state loaded.');

  const sock = makeWASocket({
    logger: pino({ level: 'debug' }),
    printQRInTerminal: false,
    auth: state
  });
  console.log('Socket created.');

  sock.ev.on('creds.update', () => {
    console.log('Credentials updated.');
    saveCreds();
  });

  sock.ev.on('connection.update', (update) => {
    console.log('Connection update:', update);
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('QR Code received, scan please:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }
    if (connection === 'close') {
      console.log('Connection closed.');
      if (lastDisconnect) {
        console.log('Last disconnect:', lastDisconnect);
      }
    }
  });

  sock.ev.on('messages.upsert', (m) => {
    console.log('New message received:', JSON.stringify(m, null, 2));
  });
}

testConnection();
