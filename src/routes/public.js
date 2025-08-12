import express from "express";
import UsersControllers from "../controllers/UsersControllers .js";
import Services from "../models/Services.js";
import { sendCode, verifyCodeSend } from "../controllers/Whatzapp.js";

const router = express.Router();

const usersController = new UsersControllers();

router.get("/getUserById/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersController.getUserById(id);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro na requisiçao" });
  }
});

router.post("/getUserByEmail", async (req, res) => {

    const { email } = req.body;
    console.log("Buscando usuário por email:", email);
  try {

    const user = await usersController.getUserByEmail(email);

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ message: "Erro na requisiçao" });
  }
});

router.post("/createUser", async (req, res) => {

  try {
    const { name, number, email, password } = req.body;

    if (!name || !number || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }

    const user = await usersController.getUserByEmail(email);

    console.log("Usuario encontrado:", user);
    if (user) {
      return res.status(402).json({ message: "Usuario ja existe" });
    }

    // verifica autenticidade do numero de telefone;

    const result = await sendCode(number);

    console.log(result + "result");

    const hashedPassword = await Services.criarHashPass(password);

    const newUser = await usersController.createUser({
      name,
      number,
      email,
      hashedPassword
    })
    console.log("Novo usuario criado:", newUser);

    const token = Services.criarToken({
      _id: newUser._id, email: newUser.email
    },
      process.env.JWT_SECRET
    );

    console.log(token);

    console.log("Token gerado:", token);

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ mensagem: "Cadastro bem-sucedido!", token: `${token}`, verifyUser: result });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
});

router.get("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await usersController.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Usuario nao encontrado" });
    }

    console.log("Usuario encontrado:", user);

    const ismatch = await Services.compararSenha(
      password,
      user.hashedPassword
    );

    console.log("Senha comparada:", ismatch);

    if (!ismatch) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = Services.criarToken(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    console.log("Token gerado:", token);
    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ mensagem: "Login bem-sucedido!", user, token: `${token}` });
  } catch (error) {
    console.log(error);
  }
});

router.post("/verifyNumber", (req, res) => {

  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ success: false, message: 'Número de telefone não fornecido.' });
  }

  // Envia o código de verificação
  sendCode(number)
    .then(response => {
      res.status(200).json({ success: true, message: 'Código de verificação enviado com sucesso.', response });
    })
    .catch(error => {
      console.error('Erro ao enviar código de verificação:', error);
      res.status(500).json({ success: false, message: 'Erro ao enviar código de verificação.', error: error.message });
    });

});

router.post("/verifyCode", async (req, res) => {

  const { number, code } = req.body;

  const otps = await verifyCodeSend(number, code);

  console.log(otps);

  if (code === otps.code) {
    return res.status(200).json(otps, { success: true, message: 'Código verificado com sucesso.' });
  };

  return res.status(400).json({ success: false, message: 'Código incorreto.' });

});

export default router;