import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import ProductsControllers from "./ProductsController.js";
import UsersControllers from "./UsersControllers.js";
import { ValidationError, NotFoundError } from "../errors/customErrors.js";

const productsController = new ProductsControllers();
const usersController = new UsersControllers();

export default class OrdersControllers {
  constructor() { }

  getCollection() {
    const db = getDataBase();
    return db.collection("orders");
  }

  async getOrdersAll() {
    return await this.getCollection().find().toArray();
  }

  async getOrders(userId) {
    // 1. Validação do ID do usuário
    if (!userId) {
      throw new ValidationError("ID de usuário inválido.");
    }

    // 2. Execução da consulta com projeção
    const orders = await this.getCollection()
      .find({ "user.id": userId })
      .sort({ createdAt: -1 })
      .toArray();

    return orders;
  }

  async createOrders(payload) {

    const {
      user,
      items,
      endereco,
      paymentMethod
    } = payload;

    const processedItems = items.map(item => ({
      ...item,
      productId: new ObjectId(item.productId)
    }));
    const ids = processedItems.map(item => item.productId.toString())
    const resProduct = await productsController.getProductsByIds(ids);

    console.log("Produtos encontrados:", resProduct);

    const valor = resProduct
      .map(produto => produto.preco)
      .reduce((acumulador, precoAtual) => {
        return acumulador + (parseFloat(precoAtual) || 0);
      }, 0);

    console.log("Valor total do pedido:", valor);

    const payment = await fetch("paymant/gerar-pix", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ valor })
    })

    const resAPI = await payment.json()

    paymentMethod.payment = resAPI;

    const dataOrders = {
      user,
      items: processedItems, // Salva a lista detalhada de itens
      endereco,
      valor,
      paymentMethod,
      status: "pendente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("orders:", dataOrders);

    await this.getCollection().insertOne(dataOrders);

    return dataOrders;
  }

  async solicitarPagamento(orderId) {
    if (!ObjectId.isValid(orderId)) {
      throw new ValidationError("ID de pedido inválido.");
    }

    const order = await this.getOrders(orderId);

    if (!order) {
      throw new NotFoundError("Pedido não encontrado.");
    }

    if (order.status !== "pendente") {
      throw new ValidationError(
        `Não é possível solicitar pagamento para um pedido com status '${order.status}'.`,
      );
    }

    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: "aguardando_pagamento", updatedAt: new Date() } },
    )

    if (result.modifiedCount === 0) {
      // Este é um erro de servidor, pois a lógica anterior deveria ter garantido a modificação.
      throw new Error("Não foi possível atualizar o status do pedido.");
    }

    return await this.getOrders(orderId);
  }

  async addToOrdersToUser(userId, productId) {
    if (!ObjectId.isValid(userId)) {
      throw new ValidationError("ID de usuário inválido.");
    }

    if (!ObjectId.isValid(productId)) {
      throw new ValidationError("ID de produto inválido.");
    }

    const user = await usersController.getUserById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    const product = await productsController.getProductById(productId);
    if (!product || product.length === 0) {
      throw new NotFoundError("Produto não encontrado.");
    }

    const result = await usersController
      .getCollection()
      .updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { pedidos: new ObjectId(productId) } },
      );

    if (result.modifiedCount === 0) {
      throw new ValidationError("Produto já está no carrinho.");
    }

    console.log(result);
    return await usersController.getUserById(userId);
  }

}
