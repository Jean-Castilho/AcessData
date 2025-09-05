import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";
import authMiddleware from "../config/auth.js";

const router = express.Router();
const usersController = new UsersControllers();

// POST /users (was POST /public/createUser)
router.post("/", async (req, res) => {
  try {
    const { token, user } = await usersController.createUserAndToken(req.body);
    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({ message: "Cadastro bem-sucedido!", token: `${token}`, user });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ message: error.message });
  }
});

// GET /users/:id (was GET /public/getUserById/:id)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Corrected bug
    const user = await usersController.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Erro na requisição" });
  }
});

// GET /users?email=... (was GET /public/getUserByEmai/:email)
// GET /users (for all users)
router.get("/", async (req, res) => {
    const { email } = req.query;
    try {
        if (email) {
            const user = await usersController.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            }
            return res.status(200).json(user);
        } else {
            const users = await usersController.getUsers();
            return res.status(200).json(users);
        }
    } catch (error) {
        return res.status(500).json({ message: "Erro na requisição" });
    }
});

// PUT /users/:id (was PUT /privacy/updateUser/:id) - Protected
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersController.updateUser(id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User nao encontrado" });
    }
    return res.status(200).json({ message: "User atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar o usuario:", error);
    return res.status(500).json({ message: "Erro ao atualizar o usuario" });
  }
});

// DELETE /users/:id (was DELETE /privacy/deleteUser/:id) - Protected
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersController.deleteUser(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Usuario nao foi encontrado" });
    }
    return res.status(200).json({ message: "Usuario deletado" });
  } catch (error) {
    console.error("Error ao deletar usuario:", error);
    return res.status(500).json({ message: "Error ao deletar usuario" });
  }
});

export default router;
