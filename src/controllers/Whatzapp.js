
/*
import express from 'express';
import UsersControllers from '../controllers/UsersControllers .js';
*/
/*
const usersController = new UsersControllers();
const router = express.Router();
*/

import {
  WHATSAPP_TOKEN,
  WHATSAPP_API_URL,
  verifyCode,
  armazenCodeOtp,
  createMessageVerifyCode,
} from '../config/whatzapp.js';

export const sendCode = async (number) => {

  if (!WHATSAPP_TOKEN || !WHATSAPP_API_URL) {
    console.error('Variáveis de ambiente do WhatsApp não configuradas.');
    return res.status(500).json({
      success: false,
      error: 'A configuração do servidor para envio de mensagens está incompleta.',
    });
  };

  const payload = createMessageVerifyCode(number);

  const otp = payload.template.components[0].parameters[0].text;

  await armazenCodeOtp(number, otp);

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(WHATSAPP_API_URL, fetchOptions);
    const data = await response.json();
    return data

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({ success: false, error: 'Erro ao enviar mensagem' });
  }
}

export const verifyCodeSend = async (number, code) => {
  const codeVerify = await verifyCode(number, code);

  console.log(codeVerify);
  
  return codeVerify || { success: false, message: 'Código não encontrado ou inválido.' };

};















/* 
export const verifyCode = async (number, code) => {
  // Implementar a lógica de verificação do código aqui



}


* Rota para enviar mensagens para todos os usuários
 * Esta rota envia uma mensagem de verificação para todos os usuários registrados
 * através da API do WhatsApp.
router.post('/send-messages', async (req, res) => {
  // Check if server configuration for WhatsApp is complete
  if (!WHATSAPP_TOKEN || !WHATSAPP_API_URL) {
    console.error('Variáveis de ambiente do WhatsApp não configuradas.');
    return res.status(500).json({
      success: false,
      error: 'A configuração do servidor para envio de mensagens está incompleta.',
    });
  }

  try {
    const allUsers = await usersController.getUsers();
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ success: false, message: 'Nenhum usuário encontrado para enviar mensagens.' });
    }

    const results = {
      sent: [],
      failed: [],
    };

    for (const user of allUsers) {
      if (!user.number) {
        console.warn(`Usuário ${user.name} (${user.email}) não possui número de telefone.`);
        results.failed.push({ user: user.email, reason: 'Número de telefone ausente.' });
        continue;
      }

      const payload = createMessageVerifyCode(user.number);

      console.log(payload);

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      try {
        console.log(`Enviando mensagem para: ${user.number}`);
        const response = await fetch(WHATSAPP_API_URL, fetchOptions);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(data.error));
        }
        results.sent.push({ user: user.email, response: data });

      } catch (error) {
        console.error(`Falha ao enviar para ${user.number}:`, error.message);
        results.failed.push({ user: user.email, reason: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Processo de envio de mensagens concluído.',
      results,
    });
  } catch (error) {
    console.error('Erro no servidor ao tentar enviar a mensagem:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
*/
