import express from "express";
import UsersControllers from "../controllers/UsersControllers .js";

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

router.get("/getUsers", async (req, res) => {
  try {
    const users = await usersController.getUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter usuario" });
  }
});

router.post("/createUser", async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    const dataUser = {
      name,
      number,
      email,
      password,
    };
    const newUser = await usersController.createUser(dataUser);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar usuario" });
  }
});

router.put("/updateUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, email, password } = req.body;
    const updatedUser = { name, number, email, password };
    const result = await usersController.updateUser(id, updatedUser);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User nao encontrado" });
    }

    return res.status(200).json({ message: "User atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar o usuario" });
  }
});

router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersController.deleteUser(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Usuario nao foi encontrado" });
    }

    return res.status(200).json({ message: "Usuario deletado" });
  } catch (error) {
    return res.status(500).json({ message: "Error ao deletar usuario" });
  }
});

export default router;
