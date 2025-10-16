import express from "express";
import UsersControllers from "../controllers/UsersControllers.js";
import ProductsControllers from "../controllers/ProductsController.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../services/responseService.js";

const router = express.Router();

const usersController = new UsersControllers();
const productsController = new ProductsControllers();

router.get("/getUserById/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await usersController.getUserById(id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.get("/getUserByEmail/:email", async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await usersController.getUserByEmail(email);
    if (!user) {
      // Mantemos a checagem aqui pois o controller retorna null para email não encontrado
      return sendNotFound(res, "Usuário não encontrado");
    }
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.post("/createUser", async (req, res, next) => {
  try {
    const { token, user } = await usersController.createUserAndToken(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return sendSuccess(
      res,
      { token: `${token}`, user },
      "Cadastro bem-sucedido!",
      201,
    );
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await usersController.login(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return sendSuccess(
      res,
      { user, token: `${token}` },
      "Login bem-sucedido!",
      201,
    );
  } catch (error) {
    next(error);
  }
});

// Rotas de produtos permanecem inalteradas por enquanto
router.post("/ProductsFavorit", async (req, res) => {
  try {
    const { favoritProducts } = req.body;
    if (!favoritProducts || !Array.isArray(favoritProducts)) {
      return sendError(res, "A lista de produtos favoritos é inválida.");
    }

    const products = await productsController.getProductsByIds(favoritProducts);
    if (!products || products.length === 0) {
      return sendNotFound(res, "Nenhum produto favorito encontrado.");
    }

    return sendSuccess(
      res,
      products,
      "Produtos favoritos encontrados com sucesso!",
    );
  } catch (error) {
    console.error("Erro ao buscar produtos favoritos:", error);
    return sendError(res, "Erro ao buscar produtos favoritos.");
  }
});

router.post("/addFavoritos", async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    const result = await usersController.addToFavorites(userId, productId);
    return sendSuccess(
      res,
      { updatedUser: result },
      "Produto adicionado aos favoritos",
    );
  } catch (error) {
    next(error);
  }
});

router.post("/removeFavoritos", async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    const updatedUser = await usersController.removeFromFavorites(
      userId,
      productId,
    );
    return sendSuccess(res, updatedUser, "Produto removido dos favoritos");
  } catch (error) {
    next(error);
  }
});

router.post("/productsCart", async (req, res) => {
  try {
    const { cartProducts } = req.body;
    if (!cartProducts || !Array.isArray(cartProducts)) {
      return sendError(res, "A lista de produtos do carrinho é inválida.");
    }

    const products = await productsController.getProductsByIds(cartProducts);
    if (!products || products.length === 0) {
      return sendNotFound(res, "Nenhum produto no carrinho encontrado.");
    }

    return sendSuccess(
      res,
      products,
      "Produtos no carrinho encontrados com sucesso!",
    );
  } catch (error) {
    console.error("Erro ao buscar produtos no carrinho:", error);
    return sendError(res, "Erro ao buscar produtos no carrinho.");
  }
});

router.post("/addCarrinho", async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    const result = await usersController.addToCarrinho(userId, productId);
    return sendSuccess(
      res,
      { updatedUser: result },
      "Produto adicionado ao carrinho",
    );
  } catch (error) {
    next(error);
  }
});

router.post("/removeCarrinho", async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    const updatedUser = await usersController.removeFromCarrinho(
      userId,
      productId,
    );

    return sendSuccess(res, updatedUser, "Produto removido do carrinho");
  } catch (error) {
    next(error);
  }
});

export default router;