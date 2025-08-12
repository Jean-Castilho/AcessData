import dotenv from 'dotenv';
import { getDataBase } from './db.js';

dotenv.config();

// --- CONFIGURAÇÕES DA API DO WHATSAPP ---
export const WHATSAPP_TOKEN = "EAAIu47964xEBPAJRGdvc9HH4I5ZBGsKZC0vb5qaKedOJBX1NuZAhkiDFuek31D1zWyrcx285YaRTlRZCU3n2ZBkwEtnO7ZA8PFsF7XnKbDcWd7rYXe0ZCuDffgbV4qMvaWw9sm3Hb7zoUiMgh98w46s412BfNTQDXO1r4VHIVTK614qpel5XHShNAk3kC5aPS55aUX8xRF9zOxmQsZBIuHFDTCpZBA11hltOncYD0UTLRbqDggR3T1oWnyRYmP7ktQQZDZD";
export const WHATSAPP_PHONE_NUMBER_ID = "740443629145374";

// Endpoint API Graph da Meta
export const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export const verifyCode = async (number, code) => {

  const otps = await getDataBase().collection('otps-code').find({ number }).toArray();

  return otps.find(otp => otp.code === code) || null;

}

export const armazenCodeOtp = async (number, code) => {
  // Implementar a lógica de armazenamento do código OTP aqui
  console.log(`Armazenando código OTP para ${number}: ${code}`);

  await getDataBase().collection('otps-code').insertOne({ number, code });

};

export const createMessageVerifyCode = (to) => {
  const otp = generateOTP();
  return {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: 'verifycode',
      language: {
        code: 'en_US'
      },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: otp }],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0, parameters: [
            {
              type: 'text',
              text: otp,
            },
          ],
        }
      ],
    },
  };

};
