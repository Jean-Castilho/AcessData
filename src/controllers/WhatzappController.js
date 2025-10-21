import {
  WHATSAPP_TOKEN,
  WHATSAPP_API_URL,
  createMessageVerifyCode,
} from "../config/whatzapp.js";

import { verifyCode } from "../services/responseService.js";


export const sendCodeWhatzapp = async (number) => {
  if (!WHATSAPP_TOKEN || !WHATSAPP_API_URL) {
    console.error("Variáveis de ambiente do WhatsApp não configuradas.");
    throw new Error(
      "A configuração do servidor para envio de mensagens está incompleta.",
    );
  }

  const fetchOptions = createMessageVerifyCode(number);

  try {
    const response = await fetch(WHATSAPP_API_URL, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data.error));
    } else {
      data.success = true;
    }
    return data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw new Error("Erro ao enviar mensagem");
  }
};

export const verifyCodeSend = async (number, code) => {
  const codeVerify = await verifyCode(number, code);
  return (
    codeVerify || {
      success: false,
      message: "Código não encontrado ou inválido.",
    }
  );
};
