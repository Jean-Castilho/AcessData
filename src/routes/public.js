import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";

const router = express.Router();

const usersController = new UsersControllers();

router.get("/getUserById/:id", async (req, res) => {
  try {
    const { id } = req.params.id;
    const user = await usersController.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro na requisição" });
  }
});

router.get("/getUserByEmai/:email", async (req, res) => {
  try {
    const { email } = req.params.email;
    const user = await usersController.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro na requisição" });
  }
});

router.post("/createUser", async (req, res) => {
  try {
    const { token, verifyUser, user } = await usersController.createUserAndToken(req.body);

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ message: "Cadastro bem-sucedido!", token: `${token}`, verifyUser, user });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const { user, token } = await usersController.login(email, password);

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        //opçao true para https
        secure: true,
        sameSite: "strict",
      })
      .json({ message: "Login bem-sucedido!", user, token: `${token}` });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

router.post("/verifyNumber", async (req, res) => {
  try {
    const { number } = req.body;
    const response = await usersController.verifyNumber(number);
    res.status(200).json({ success: true, message: 'Código de verificação enviado com sucesso.', response });
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verifyCode", async (req, res) => {
  try {
    const { number, code } = req.body;
    const otps = await usersController.verifyCode(number, code);
    return res.status(200).json({ ...otps, success: true, message: 'Código verificado com sucesso.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
