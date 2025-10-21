
export const sendSuccess = (
  res,
  data,
  message = "Operação realizada com sucesso",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "Ocorreu um erro",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendNotFound = (res, message = "Recurso não encontrado") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

export const sendUnauthorized = (res, message = "Não autorizado") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

export const sendBadRequest = (res, message = "Requisição inválida") => {
  return res.status(400).json({
    success: false,
    message,
  });
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

import { getDataBase } from "../config/db.js";

export const verifyCode = async (params, code) => {
  const otps = await getDataBase()
    .collection("otps-code")
    .find({ params })
    .toArray();

  return otps.find((otp) => otp.code === String(code)) || null;
};

export const armazenCodeOtp = async (params, code) => {
  await getDataBase().collection("otps-code").insertOne({ params, code });
};