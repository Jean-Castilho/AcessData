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

  async getProducts() {
    const products = await this.getCollection().find().toArray();
    return products;
  }

  async getProductsByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }

    const objectIds = ids
      .map((id) => {
        if (ObjectId.isValid(id)) {
          return new ObjectId(id);
        }
        return null;
      })
      .filter((id) => id !== null);

    if (objectIds.length === 0) {
      return [];
    }

    const products = await this.getCollection()
      .find({ _id: { $in: objectIds } })
      .toArray();
      
    return products;
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

    return product;
  }

  async createProduct(productData) {
    const result = await this.getCollection().insertOne(productData);
    return result;
  }
  // Versão simplificada: não usa endereço, só campos essenciais + imagens
  async uploadProductAndImage(req) {
    const files =
      req.body.files && req.body.files.length
        ? req.body.files
        : req.body.file
          ? [req.body.file]
          : [];

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

    const productData = {
      // --- Informações Principais ---
      nome: req.body.nome, // Ex: "Poltrona Costela com Puff".
      slug: req.body.slug, // Ex: "poltrona-costela-com-puff-couro-preto".
      preco: parseFloat(req.body.preco), // Ex: 1890.00
      imagens: files,
      // --- Organização e Estilo ---
      ambientes: req.body.ambientes, // Array. Ex: ["Sala de Estar", "Quarto", "Escritório"].
      estilo: req.body.estilo, // Ex: "Moderno", "Industrial", "Clássico".
      colecao: req.body.colecao, // Ex: "Coleção Viena 2024".
      // --- Variações de Produto ---
      // Cada objeto aqui é uma versão do produto que o cliente pode comprar.
      /*variacoes: [
       Exemplo de um array que viria do req.body.variacoes.
      {
        sku: "POL-COS-01-PRE",
        cor: "Preto",
        acabamento: "Couro Ecológico",
        preco: 1890.00,
        precoPromocional: 1699.00,
        estoque: 15,
        imagens: ["url_imagem_preta_1.jpg", "url_imagem_preta_2.jpg"] // Imagens específicas da variação
      },
      {
        sku: "POL-COS-01-MAR",
        cor: "Marrom",
        acabamento: "Linho",
        preco: 1950.00,
        estoque: 8,
        imagens: ["url_imagem_marrom_1.jpg"]
      }]
      */

      // --- Logística e Garantia ---
      estoque: req.body.estoque, // Ex: 15 (número inteiro).
      requerMontagem: req.body.requerMontagem, // boolean: true ou false
      garantia: req.body.garantia, // Ex: "12 meses"
      ativo: req.body.ativo, // Ex: "disponivel na loja"

      categoria: req.body.categoria,
      descricao: req.body.descricao,
      dimensoes: {
        altura: req.body.altura,
        largura: req.body.largura,
        profundidade: req.body.profundidade,
      },
      peso: req.body.peso,
    };

    const result = await this.createProduct(productData);

    // retorna o documento criado já com imagens convertidas (via getProductById)
    const created = await this.getProductById(result.insertedId.toString());
    return created;
  }

  async updateProductAndImages(id, req) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    const existingProduct = await this.getCollection().findOne({ _id: objectId });
    if (!existingProduct) {
      return null;
    }

    const files =
      req.body.files && req.body.files.length
        ? req.body.files
        : req.body.file
          ? [req.body.file]
          : [];

    let imageNames = existingProduct.imagens || [];

    if (files && files.length > 0) {
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

      const uploadedFiles = await Promise.all(uploadPromises);
      imageNames = [...imageNames, ...uploadedFiles];
    }

    const updatedProduct = {
      ...existingProduct,
      ...req.body,
      imagens: imageNames,
    };

    await this.getCollection().updateOne({ _id: objectId }, { $set: updatedProduct });
    return updatedProduct;
  }

  async deleteProduct(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);

    return await this.getCollection().deleteOne({ _id: objectId });
  }
}
