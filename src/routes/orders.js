import express from "express";

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
    
    console.log("Pedido encontrado:", orders);
    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

export default router;