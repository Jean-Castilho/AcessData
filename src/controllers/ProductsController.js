import { ObjectId } from "mongodb";
import { getDataBase, getGridFSBucket } from "../config/db.js";
import { Readable } from "stream";

export default class ProductsControllers {
  constructor() {
    // O construtor fica vazio. A conexão com o banco será obtida
    // sob demanda dentro de cada método, para garantir que a conexão
    // já foi estabelecida pelo index.js.
  }

  // Método auxiliar para obter a coleção de produtos
  getCollection() {
    const db = getDataBase();
    return db.collection("products");
  }

  async getProductById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    const product = await this.getCollection().findOne({ _id: objectId });
    if (!product) {
      return null;
    }

    const bucket = getGridFSBucket();

    // Suporta produto com múltiplas imagens (campo 'imagens' array)
    if (Array.isArray(product.imagens) && product.imagens.length > 0) {
      const imagensData = [];

      for (const filename of product.imagens) {
        try {
          const downloadStream = bucket.openDownloadStreamByName(filename);
          const chunks = [];
          for await (const chunk of downloadStream) {
            chunks.push(chunk);
          }
          const base64Image = Buffer.concat(chunks).toString("base64");
          imagensData.push(`data:image/jpeg;base64,${base64Image}`);
        } catch (err) {
          console.warn(`Falha ao obter imagem ${filename}:`, err.message);
        }
      }

      return {
        ...product,
        imagens: imagensData,
      };
    }

    // Compatibilidade com campo legacy 'imagem' (string única)
    if (product.imagem) {
      try {
        const downloadStream = bucket.openDownloadStreamByName(product.imagem);
        const chunks = [];
        for await (const chunk of downloadStream) {
          chunks.push(chunk);
        }
        const base64Image = Buffer.concat(chunks).toString("base64");
        return {
          ...product,
          imagem: `data:image/jpeg;base64,${base64Image}`,
        };
      } catch (err) {
        console.warn(`Falha ao obter imagem ${product.imagem}:`, err.message);
        return product;
      }
    }

    return product;
  }

  async getProducts() {
    const products = await this.getCollection().find().toArray();
    return products;
  }

  async createProduct(productData) {
    const result = await this.getCollection().insertOne(productData);
    return result;
  }

  // Versão simplificada: não usa endereço, só campos essenciais + imagens
  async uploadProductAndImage(req) {
    const files = req.files && req.files.length ? req.files : req.file ? [req.file] : [];

    if (!files || files.length === 0) {
      throw new Error("Nenhum arquivo foi enviado");
    }

    const bucket = getGridFSBucket();

    // Faz upload de todos os arquivos e obtém os nomes usados no GridFS
    const uploadPromises = files.map((file) => {
      return new Promise((res, rej) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(uniqueName, {
          contentType: file.mimetype,
          metadata: { originalname: file.originalname },
        });
        readableStream.pipe(uploadStream);

        uploadStream.on("finish", () => res(uniqueName));
        uploadStream.on("error", (err) => rej(err));
      });
    });

    const uploadedFileNames = await Promise.all(uploadPromises);

    const productData = {
      preco: req.body.preco,
      disponibilidade: req.body.disponibilidade,
      descricao: req.body.descricao,
      tamanho: req.body.tamanho,
      imagens: uploadedFileNames, // array de nomes no GridFS
    };

    const result = await this.createProduct(productData);

    // retorna o documento criado já com imagens convertidas (via getProductById)
    const created = await this.getProductById(result.insertedId.toString());
    return created;
  }

  async updateProduct(id, updatedProduct) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    return await this.getCollection().updateOne(
      { _id: objectId },
      { $set: updatedProduct }
    );
  }

  async deleteProduct(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    return await this.getCollection().deleteOne({ _id: objectId });
  }
}
