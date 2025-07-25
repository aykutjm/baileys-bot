const { default: makeWASocket, useSingleFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSock() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    if (msg.message.imageMessage) {
      const buffer = await downloadMediaMessage(msg, 'buffer', {}, { mediaType: 'image' });
      const base64 = buffer.toString('base64');

      // Coolify üzerinden n8n webhook’una gönder
      await axios.post('https://n8n.domain.com/webhook/gpt', {
        base64,
        mime: 'image/jpeg',
        prompt: 'Bu görselde ne görüyorsun?',
      });
    }
  });

  sock.ev.on('creds.update', saveState);
}

startSock();
