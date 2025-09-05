import express from "express";
import multer from "multer";
import ProductsControllers from "../controllers/ProductsController.js";
import authMiddleware from "../config/auth.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const productsController = new ProductsControllers();

// GET /products (was GET /products/getAllProducts)
router.get("/", async (req, res) => {
  try {
    const products = await productsController.getProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter produtos" });
  }
});

// GET /products/:id (was GET /products/getProductById/:id)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsController.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    return res.status(200).json({
      message: "Produto encontrado",
      product: product,
    });
  } catch (error) {
    console.error("Erro ao obter o produto:", error);
    return res.status(500).json({ message: "Erro ao obter o produto" });
  }
});

// POST /products (was POST /products/upload)
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const result = await productsController.uploadProductAndImage(req);
    res.status(201).json({
      message: "Arquivos enviados e produto criado com sucesso",
      product: result,
    });
  } catch (error) {
    console.error("Erro ao criar o produto:", error);
    res.status(500).json({ message: "Erro ao criar o produto:", error: error.message });
  }
});

// PUT /products/:id (was PUT /privacy/updateProduct/:id) - Protected
router.put("/:id", authMiddleware, async (req, res) => {
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

// DELETE /products/:id (was DELETE /privacy/deleteProduct/:id) - Protected
router.delete("/:id", authMiddleware, async (req, res) => {
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
