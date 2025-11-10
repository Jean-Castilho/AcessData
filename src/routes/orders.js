import express from "express";
import {consultarPix} from "../controllers/Paymantcontrollet.js";
import OrdersControllers from "../controllers/OrdensControllers.js";
import { sendSuccess, sendError } from "../services/responseService.js";

const router = express.Router();
const ordersController = new OrdersControllers();

router.post("/", async (req, res, next) => {
  try {

    const newOrder = await ordersController.createOrders(req.body);

    return sendSuccess(res, newOrder, "Pedido criado com sucesso", 201);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await ordersController.getOrderById(id);
    if (!order) {
      return sendError(res, "Pedido não encontrado");
    }
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.get("/cosultar-pix/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await consultarPix(id);
    if (!order) {
      return sendError(res, "Pedido não encontrado");
    }
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const orders = await ordersController.getOrdersAll();

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/payment", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedOrder = await ordersController.solicitarPagamento(id);
    return sendSuccess(
      res,
      updatedOrder,
      "Solicitação de pagamento processada",
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await ordersController.getOrders(userId);
    
    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/status", async (req, res, next) => {
  const orderId = req.params.id;
  try {
    const updatedOrder = await ordersController.updateStatus(orderId);
    return sendSuccess(res, updatedOrder, "Status atualizado com sucesso");
  } catch (error) {
    next(error);
  }
});

router.put("/:id/cancel", async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const updatedOrder = await ordersController.cancelOrder(orderId);
    return sendSuccess(res, updatedOrder, "Pedido cancelado com sucesso");
  } catch (error) {
    next(error);
  }
})

export default router;