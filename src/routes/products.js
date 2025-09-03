import express from "express";
import multer from "multer";
import ProductsControllers from "../controllers/ProductsController.js";

const upload = multer({ storage: multer.memoryStorage() }); // garante file.buffer
const router = express.Router();

const productsController = new ProductsControllers();

router.post("/upload", upload.array("files"), async (req, res) => {
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

router.get("/getProductById/:id", async (req, res) => {
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

router.get("/getProducts", async (req, res) => {
  try {
    const products = await productsController.getProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter produtos" });
  }
});

export default router;
