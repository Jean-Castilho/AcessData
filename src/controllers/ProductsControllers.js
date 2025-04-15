import express from "express";
import { getDataBase } from "../config/db.js";

const router = express.Router();

export default class ProductsControllers {
  constructor() {
    this.uri = process.env.DATABASE_URL;
    this.client = getDataBase();
    this.database = this.client;
    this.products = this.database.collection("products");
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await this.products.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({ message: "Producto naão encontrado" });
      }
      return product;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getProducts(req, res) {
    try {
      const products = await this.products.find().toArray();
      return products;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createProduct(productData) {

    const result = await this.products.insertOne(productData);

    return result;
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { nome, preco, descricao, imagem } = req.body;
      const updatedProduct = { nome, preco, descricao, imagem };
      const result = await this.products.updateOne(
        { _id: id },
        { $set: updatedProduct }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      return res
        .status(200)
        .json({ message: "Produto atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await this.products.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      return res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
