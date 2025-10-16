import express from "express";
import multer from "multer";
import ProductsControllers from "../controllers/ProductsController.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../services/responseService.js";

const upload = multer({ storage: multer.memoryStorage() }); // garante file.buffer
const router = express.Router();

const productsController = new ProductsControllers();

router.post("/", upload.array("files"), async (req, res) => {
  try {
    const product = await productsController.uploadProductAndImage(req);
    return sendSuccess(
      res,
      { product },
      "Arquivos enviados e produto criado com sucesso",
      201,
    );
  } catch (error) {
    console.error("Erro ao criar o produto:", error);
    return sendError(res, `Erro ao criar o produto: ${error.message}`);
  }
});

router.put("/:id", upload.array("files"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productsController.updateProductAndImages(
      id,
      req,
    );
    if (!updatedProduct) {
      return sendNotFound(res, "Produto não encontrado");
    }
    return sendSuccess(
      res,
      { product: updatedProduct },
      "Produto atualizado com sucesso",
    );
  } catch (error) {
    console.error("Erro ao atualizar o produto:", error);
    return sendError(res, `Erro ao atualizar o produto: ${error.message}`);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsController.getProductById(id);
    if (!product) {
      return sendNotFound(res, "Produto não encontrado");
    }
    return sendSuccess(res, product);
  } catch (error) {
    console.error("Erro ao obter o produto:", error);
    return sendError(res, "Erro ao obter o produto");
  }
});

router.get("/", async (req, res) => {
  try {
    const allProducts = await productsController.getProducts();
    return sendSuccess(res, allProducts);
  } catch (error) {
    return sendError(res, "Erro ao obter produtos");
  }
});

router.delete("/", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await productsController.deleteProduct(id);

    if (result.deletedCount === 0) {
      return sendNotFound(res, "Produto nao foi encontrado");
    }
    return sendSuccess(res, null, "Produto deletado");
  } catch (error) {
    return sendError(res, "Error ao deletar produto");
  }
});

export default router;
