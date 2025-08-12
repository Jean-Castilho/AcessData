import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(token);

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token inválido:", err.message);
      } else {
        console.log("Token válido. Dados decodificados:", decoded);
      }
    });
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido" });
  }
};

export default auth;