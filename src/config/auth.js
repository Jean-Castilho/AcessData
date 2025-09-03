import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// --- Funções de Autenticação ---

export function criarToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não está definido no arquivo .env.");
  }

  const expiresIn = process.env.JWT_EXPIRATION || "1h";

  return jwt.sign(payload, secret, { expiresIn });
}

export function verificarToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("Chave secreta não definida. A verificação do token falhará.");
    return null;
  }

  try {
    return jwt.verify(token, secret);
  } catch (err) {
    // Em vez de logar o erro inteiro, logamos uma mensagem mais genérica
    console.error("Tentativa de verificação de token inválido:", err.message);
    return null;
  }
}

export async function criarHashPass(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "12", 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function compararSenha(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}


// --- Middleware de Autenticação Aprimorado ---

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensagem: "Acesso negado. Nenhum token fornecido." });
  }

  const decoded = verificarToken(token);

  if (!decoded) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }

  // Adiciona os dados do usuário decodificados ao objeto de requisição para uso posterior
  req.user = decoded;
  
  next();
};

export default authMiddleware;
