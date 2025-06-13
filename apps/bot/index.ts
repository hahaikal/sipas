import { makeWASocket, useMultiFileAuthState, WASocket, proto } from '@whiskeysockets/baileys';
import pino from 'pino';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { handleIncomingMessage } from './services/whatsAppService';

const usePairingCode = false;

async function connectToWhatsApp(): Promise<void> {
  console.log(chalk.blue('Connecting to WhatsApp...'));
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const bot: WASocket = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state
  });

  bot.ev.on('creds.update', saveCreds);

  bot.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log(chalk.cyan('QR Code received, scan please:'));
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      console.log(chalk.red('Connection closed. Last disconnect error:'), lastDisconnect?.error);
      if ((lastDisconnect?.error as any)?.output?.statusCode !== 401) {
        console.log(chalk.red('Connection closed. Reconnecting...'));
        connectToWhatsApp();
      } else {
        console.log(chalk.red('Connection closed. Please scan the QR code again.'));
      }
    } else if (connection === 'open') {
      console.log(chalk.green('Connected to WhatsApp!'));
    }
  });

  bot.ev.on('messages.upsert', async (m: { messages: proto.IWebMessageInfo[] }) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body: string =
      (msg.message.conversation as string) ||
      (msg.message.extendedTextMessage?.text as string) ||
      '';
    const sender = msg.key?.remoteJid || '';
    const pushname = msg.pushName || 'Bot';

    console.log(
      chalk.green.bold('[' + new Date().toLocaleString() + '] '),
      chalk.blue(pushname),
      chalk.white('(' + (sender.split('@')[0]) + ')'),
      chalk.white('> '),
      chalk.white(body)
    );

    await handleIncomingMessage(bot, msg);
  });
}

connectToWhatsApp();