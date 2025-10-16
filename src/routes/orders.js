import express from "express";

import https from "https";
import OrdersControllers from "../controllers/OrdensControllers.js";
import { sendSuccess } from "../services/responseService.js";

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

    console.log(orders)

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

router.get("/cep/:cep", (req, res) => {
  const cep = req.params.cep;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return sendError(res, "A chave da API do Google Maps não está configurada no servidor.", 500);
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${apiKey}`;

  https.get(url, (apiRes) => {
    let data = "";
    apiRes.on("data", (chunk) => {
      data += chunk;
    });
    apiRes.on("end", () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.status === "OK" && jsonData.results.length > 0) {
          const addressComponents = jsonData.results[0].address_components;

          console.log("adresscomponet", addressComponents)

          const getComponent = (type) => {
            const component = addressComponents.find((c) => c.types.includes(type));
            return component ? component.long_name : "";
          };

          const address = {
            rua: getComponent("route"),
            bairro: getComponent("sublocality_level_1") || getComponent("political"),
            cidade: getComponent("administrative_area_level_2"),
            estado: getComponent("administrative_area_level_1"),
          };

          // Ajuste para o bairro, caso não venha no campo esperado
          if (address.bairro === address.cidade) {
            const sublocality = addressComponents.find((c) => c.types.includes("sublocality"));
            if (sublocality) address.bairro = sublocality.long_name;
          }

          console.log("endereço:", address);

          return sendSuccess(res, address, "Endereço encontrado com sucesso!");
        } else {
          return sendNotFound(res, "CEP não encontrado ou inválido.");
        }
      } catch (e) {
        return sendError(res, "Erro ao processar a resposta da API de geocodificação.", 500);
      }
    });
  }).on("error", (e) => {
    return sendError(res, "Erro ao fazer a requisição para a API de geocodificação.", 500);
  });
});

export default router;