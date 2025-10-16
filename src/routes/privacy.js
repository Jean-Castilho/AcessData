import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";
import ProductsControllers from "../controllers/ProductsController.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../services/responseService.js";

const router = express.Router();

const usersController = new UsersControllers();
const productsController = new ProductsControllers();

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersController.updateUser(id, req.body);

    if (result.matchedCount === 0) {
      return sendNotFound(res, "User nao encontrado");
    }

    return sendSuccess(res, null, "User atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar o usuario:", error);
    return sendError(res, "Erro ao atualizar o usuario");
  }
});

router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersController.deleteUser(id);

    if (result.deletedCount === 0) {
      return sendNotFound(res, "Usuario nao foi encontrado");
    }

    return sendSuccess(res, null, "Usuario deletado");
  } catch (error) {
    console.error("Error ao deletar usuario:", error);
    return sendError(res, "Error ao deletar usuario");
  }
});

router.put("/updateProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.updateProduct(id, req.body);

    if (result.matchedCount === 0) {
      return sendNotFound(res, "Produto não encontrado");
    }

    return sendSuccess(res, null, "Produto atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    return sendError(res, "Erro ao atualizar o produto");
  }
});

router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsController.deleteProduct(id);

    if (result.deletedCount === 0) {
      return sendNotFound(res, "Produto não encontrado");
    }

    return sendSuccess(res, null, "Produto deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar o produto:", error);
    return sendError(res, "Erro ao deletar o produto");
  }
});

export default router;
