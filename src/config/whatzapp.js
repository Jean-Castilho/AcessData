import dotenv from "dotenv";
import { generateOTP, armazenCodeOtp } from "../services/responseService.js";

dotenv.config();

export const WHATSAPP_TOKEN =
  "EAAIu47964xEBPAJRGdvc9HH4I5ZBGsKZC0vb5qaKedOJBX1NuZAhkiDFuek31D1zWyrcx285YaRTlRZCU3n2ZBkwEtnO7ZA8PFsF7XnKbDcWd7rYXe0ZCuDffgbV4qMvaWw9sm3Hb7zoUiMgh98w46s412BfNTQDXO1r4VHIVTK614qpel5XHShNAk3kC5aPS55aUX8xRF9zOxmQsZBIuHFDTCpZBA11hltOncYD0UTLRbqDggR3T1oWnyRYmP7ktQQZDZD";
export const WHATSAPP_PHONE_NUMBER_ID = "740443629145374";
export const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;


export const createMessageVerifyCode = async (to) => {
  const otp = generateOTP();

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: "verifycode",
      language: {
        code: "en_US",
      },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otp }],
        },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
      ],
    },
  };

  await armazenCodeOtp(to, otp);

  const fetchOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  return fetchOptions;

};
