import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

function criarToken(payload, secretKey) {
  if (!payload || !secretKey) {
    throw new Error("Payload e secretKey são obrigatórios.");
  }
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

function verificarToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Token inválido:", err);
    return null;
  }
};

async function criarHashPass(password) {
  // Hash da senha;
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  console.log("Senha criptografada:", hashedPassword);
  
  return hashedPassword;
};

async function compararSenha(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

const Services = {
  criarToken,
  criarHashPass,
  verificarToken,
  compararSenha,
};

export default Services;
