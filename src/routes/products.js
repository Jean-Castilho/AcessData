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

router.get("/getProductById/:id", getProductById);

router.get("/getProducts", getProducts);

router.post("/createProduct", createProduct);

router.put("/updateProduct/:id", updateProduct);

router.delete("/deleteProduct/:id", deleteProduct);

export default router;