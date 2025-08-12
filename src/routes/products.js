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
  readableStream.push(null); // Finaliza o stream;

  const bucket = getGridFSBucket();
  const uploadStream = bucket.openUploadStream(req.file.originalname);

  readableStream.pipe(uploadStream);

  const dataEndereco = {
    bairro: req.body.bairro,
    cidade: req.body.cidade,
    estado: req.body.estado,
    cordenadas: {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
    rua: req.body.rua,
  };

  uploadStream.on("finish", async () => {

    try {
      const productData = {
        endereco: dataEndereco,
        preco: req.body.preco,
        disponibilidade: req.body.disponibilidade,
        descricao: req.body.descricao,
        tamanho: req.body.tamanho,
        imagem: req.file.originalname,
      };

      const result = await productsController.createProduct(productData);

      console.log("Produto criado com sucesso:", result);
      
      res.status(201).json({
        message: "Arquivo enviado e produto criado com sucesso",
        product: result,
      });
    } catch (error) {
      console.error("Erro ao criar o produto:", error);
      res.status(500).json({ message: "Erro ao criar o produto:", error });
    }

  });

  uploadStream.on("error", (error) => {
    console.error("Erro ao enviar o arquivo:", error);
    return res.status(500).json({ message: "Erro ao enviar o arquivo", error });
  });
});

router.get("/getProductById/:id", async (req, res) => {
  const { id } = req.params;

  console.log(id);

  const product = await productsController.getProductById(id);
  if (!product) {
    return res.status(404).json({ message: "Produto não encontrado" });
  }
  const filename = product.imagem;
  const bucket = getGridFSBucket();

  // Cria o stream para baixar a imagem
  const downloadStream = bucket.openDownloadStreamByName(filename);

  let imageData = [];

  // Lê os dados da imagem em chunks
  downloadStream.on("data", (chunk) => {
    imageData.push(chunk);
  });

  // Quando o stream terminar, converte a imagem para base64 e retorna o produto
  downloadStream.on("end", async () => {
    const base64Image = Buffer.concat(imageData).toString("base64");

    return res.status(200).json({
      message: "Produto encontrado",
      product: {
        ...product,
        imagem: `data:image/jpeg;base64,${base64Image}`, // Inclui a imagem em base64
      },
    });
  });

  // Trata erros no stream
  downloadStream.on("error", (error) => {
    console.error("Erro ao obter a imagem:", error);
    return res.status(500).json({ message: "Erro ao obter a imagem" });
  });

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