import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import dotenv from "dotenv";
dotenv.config();
/**
 * Gera um token JWT com base nas informações fornecidas e na chave secreta.
 * @param {Object} payload - Informações a serem incluídas no token.
 * @param {string} payload.userId - O ID do usuário.
 * @param {string} payload.role - O papel do usuário (e.g., 'admin', 'user').
 * @param {string} secretKey - Chave secreta para assinar o token.
 * @param {Object} [options] - Opções adicionais para o token (ex: expiresIn).
 * @returns {string} - Token JWT gerado.
 */

function criarToken(payload, secretKey, options = {}) {
  if (!payload || !secretKey) {
    throw new Error("Payload e secretKey são obrigatórios.");
  }
  return jwt.sign(payload, secretKey, options);
}

function verificarToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Token inválido:", err);
    return null;
  }
}

async function criarHashPass(password) {
  // Hash da senha;
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function compararSenha(password, hashedPassword) {
  return await this.bcrypt.compare(password, hashedPassword);
}

const Services = {
  criarToken,
  criarHashPass,
  verificarToken,
  compararSenha,
};

export default Services;
