import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";

const router = express.Router();
const usersController = new UsersControllers();

// POST /auth/login (was POST /public/login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await usersController.login(email, password);

    return res
      .status(200) // 200 is more appropriate for a successful login than 201
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ message: "Login bem-sucedido!", user, token: `${token}` });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

export default router;
