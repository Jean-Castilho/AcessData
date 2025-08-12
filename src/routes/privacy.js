import express from "express";
import UsersControllers from "../controllers/UsersControllers .js";

const router = express.Router();

const usersController = new UsersControllers();

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

router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, descricao, imagem } = req.body;
    const updatedProduct = { nome, preco, descricao, imagem };
    const result = await productsController.updateProduct(id, updatedProduct);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    return res.status(200).json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.deleteProduct(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    return res.status(200).json({ message: "Produto deletado com sucesso" });
  } catch (error) { }
});

export default router;