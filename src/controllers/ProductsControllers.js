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

  async getProductById(id) {
    const product = await this.products.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ message: "Producto naão encontrado" });
    }
    return product;
  }

  async getProducts(req, res) {
    return (products = await this.products.find().toArray());
  }

  async createProduct(productData) {
    return (result = await this.products.insertOne(productData));
  }

  async updateProduct(id, updatedProduct) {
    return (result = await this.products.updateOne(
      { _id: id },
      { $set: updatedProduct }
    ));
  }

  async deleteProduct(id) {
    return (result = await this.products.deleteOne({ _id: id }));
  }
}
