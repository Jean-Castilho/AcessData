import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";
import ProductsControllers from "../controllers/ProductsController.js";

const router = express.Router();

const usersController = new UsersControllers();
const productsController = new ProductsControllers();

router.put("/updateUser/:id", async (req, res) => {
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

router.delete("/deleteUser/:id", async (req, res) => {
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

router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.updateProduct(id, req.body);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    return res.status(200).json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    return res.status(500).json({ message: "Erro ao atualizar o produto" });
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
  } catch (error) {
    console.error("Erro ao deletar o produto:", error);
    return res.status(500).json({ message: "Erro ao deletar o produto" });
  }
});

export default router;
