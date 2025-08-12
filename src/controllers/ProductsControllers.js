import express from "express";
import { ObjectId } from "mongodb";
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
    // Verifica se o ID é válido
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    // Converte o ID para ObjectId
    const objectId = new ObjectId(id);

    const product = await this.products.findOne({ _id: objectId });

    console.log(product);

    if (!product) {
      return null;
    }
    return product;
  }

  async getProducts() {
    const products = await this.products.find().toArray();
    return products;
  }

  async createProduct(productData) {
    const result = await this.products.insertOne(productData);
    return result;
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
