import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import ProductsControllers from "./ProductsController.js";
import { gerarPix, consultarPix } from "./Paymantcontrollet.js";
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

  async getordersByDelivered() {
    
    const approved = await this.getCollection().find({ status: "approved"}).toArray();
    const shipped = await this.getCollection().find({ status: "shipped"}).toArray();

    return [...shipped,...approved];

  }

  async getOrdersById(id) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de pedido inválido.");
    }

    const order = await this.getCollection().findOne({ _id: new ObjectId(id) });
    return order;
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

    // Itera sobre os pedidos para atualizar o status de pagamento;
    await Promise.all(orders.map(async (order) => {
      
      if (order.paymentMethod && order.paymentMethod.payment && order.paymentMethod.payment.id) {
        
        try {
          
          const paymentDetails = await consultarPix(order.paymentMethod.payment.id);
          
          if (paymentDetails && paymentDetails.status && order.paymentMethod.payment.status !== paymentDetails.status) {

            const newStatus = paymentDetails.status;

            // Atualiza o status no banco de dados;
            await this.getCollection().updateOne(
              { _id: order._id },
              { $set: { "paymentMethod.payment.status": newStatus, "status": newStatus, "updatedAt": new Date() } }
            );
            // Atualiza o status no objeto do pedido;
            order.paymentMethod.payment.status = newStatus;
            order.status = newStatus;
            order.updatedAt = new Date();

          }
        } catch (error) {
          console.error(`Erro ao atualizar status do pedido ${order._id}:`, error);
        }
      }
    }));

    const ordersPending = orders.filter(order => order.status === "pending");
    const ordersShipped = orders.filter(order => order.status === "shipped");
    const ordersApprovad = orders.filter(order => order.status === "approved");
    const ordersDelivered = orders.filter(order => order.status === "delivered");
    const ordersCanceled = orders.filter(order => order.status === "canceled");
  
    return [...ordersPending, ...ordersShipped, ...ordersApprovad, ...ordersDelivered, ...ordersCanceled]
    
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

    const valor = resProduct
      .map(produto => produto.preco)
      .reduce((acumulador, precoAtual) => {
        return acumulador + (parseFloat(precoAtual) || 0);
      }, 0);

    const payment = await gerarPix(valor);

    paymentMethod.payment = payment;

    const dataOrders = {
      user,
      items: processedItems, // Salva a lista detalhada de itens
      endereco,
      valor,
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.getCollection().insertOne(dataOrders);

    return dataOrders;
  }

  async solicitarPagamento(id) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de pedido inválido.");
    }

    const order = await this.getOrdersById(id);

    if (!order) {
      throw new NotFoundError("Pedido não encontrado.");
    }

    if (order.status !== "pendente") {
      throw new ValidationError(
        `Não é possível solicitar pagamento para um pedido com status '${order.status}'.`,
      );
    }

    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "aguardando_pagamento", updatedAt: new Date() } },
    )

    if (result.modifiedCount === 0) {
      // Este é um erro de servidor, pois a lógica anterior deveria ter garantido a modificação.
      throw new Error("Não foi possível atualizar o status do pedido.");
    }

    return await this.getOrdersById(id);
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

    return await usersController.getUserById(userId);
  }

  async updateStatus(orderId) {

    if (!ObjectId.isValid(orderId)) {
      throw new ValidationError("ID de pedido inválido.");
    }

    const order = await this.getOrdersById(orderId);

    order.status = "shipped";

    const result = await this.getCollection().updateOne({ _id: new ObjectId(orderId) }, { $set: order });

    if (result.modifiedCount === 0) {

      throw new ValidationError("Não foi possível atualizar o status do pedido.");
    }

    return await this.getOrdersById(orderId);

    }

  }
