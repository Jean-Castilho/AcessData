import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { getGridFSBucket } from "../config/db.js";
import ProductsControllers from "../controllers/ProductsControllers.js";

const upload = multer();
const router = express.Router();

const productsController = new ProductsControllers();

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
  }

  console.log("Iniciando upload do arquivo:", req.file.originalname);

  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null); // Finaliza o stream

  const bucket = getGridFSBucket();
  const uploadStream = bucket.openUploadStream(req.file.originalname);

  readableStream.pipe(uploadStream);

  uploadStream.on("finish", async () => {
    try {
      const productData = {
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: req.body.descricao,
        imagem: req.file.originalname,
      };

      const result = await productsController.createProduct(productData);
      res.status(201).json({
        message: "Arquivo enviado e produto criado com sucesso",
        product: result,
      });
    } catch (error) {
      console.error("Erro ao criar o produto:", error);
      res.status(500).json({ message: "Erro ao criar o produto", error });
    }
  });

  uploadStream.on("error", (error) => {
    console.error("Erro ao enviar o arquivo:", error);
    return res.status(500).json({ message: "Erro ao enviar o arquivo", error });
  });
});

router.get("/getProductById/:id", async (req, res) => {
  try {
    return res
      .status(200)
      .json({
        message: "Produto encontrado",
        product: await productsController.getProductById(req.params.id),
      });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao encontrar o produto" });
  }
});

router.get("/getProducts", async (req,res) => {
  try{
    const products = await productsController.getProducts();
    return res.status(200).json(products);
  }catch(error) {
    return res.status(500).json({ message: "Erro ao obter produtos" });
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

router.delete("/deleteProduct/:id", async (req,res) => {
  try {
    
    const { id } = req.params;
    const result = await productsController.deleteProduct(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    return res.status(200).json({ message: "Produto deletado com sucesso" });

  } catch (error) {
    
  }
});

export default router;
