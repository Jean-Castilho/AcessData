import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import { validateData } from "../services/validationService.js";
import { criarToken, criarHashPass, compararSenha } from "../config/auth.js";
import { sendCodeWhatzapp, verifyCodeSend } from "./WhatzappController.js";
import ProductsControllers from "./ProductsController.js";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";

const productsController = new ProductsControllers();

export default class UsersControllers {
  constructor() {
    // A conexão com o banco será obtida sob demanda dentro de cada método,
    //  para garantir que a conexão já foi estabelecida pelo index.js.
  }

  // Método auxiliar para obter a coleção de usuários sob demanda
  getCollection() {
    const db = getDataBase();
    return db.collection("users");
  }

  async getUserById(id) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de usuário inválido");
    }
    const objectId = new ObjectId(id);
    const user = await this.getCollection().findOne({ _id: objectId });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  async getUsers() {
    const users = await this.getCollection().find().toArray();
    return users;
  }

  async getUserByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    return await this.getCollection().findOne({ "email.endereco": normalized });
  }

  async createUser({ name, number, email, hashedPassword }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const dataUser = {
      name,
      hashedPassword,
      role: "user",
      pedidos: [],
      telefone: { verified: false, number: number, otps: {} },
      email: { verified: false, endereco: normalizedEmail, otps: {} },
      cart: [],
      favorites: [],
    };
    return await this.getCollection().insertOne(dataUser);
  }

  async verifiedUser({ email, number } = {}) {
    const query = {};
    if (email) query["email.endereco"] = email;
    if (number) query["telefone.number"] = number;
    if (Object.keys(query).length === 0) return null;
    const user = await this.getCollection().findOne(query);
    return user;
  }

  async updateUser(id, updatedUser) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de usuário inválido");
    }
    const objectId = new ObjectId(id);
    // Não permitir atualizar o campo _id via $set
    const safeUpdate = { ...updatedUser };
    if (safeUpdate._id) delete safeUpdate._id;

    return await this.getCollection().updateOne(
      { _id: objectId },
      { $set: safeUpdate },
    );
  }

  async deleteUser(id) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de usuário inválido");
    }
    const objectId = new ObjectId(id);
    return await this.getCollection().deleteOne({ _id: objectId });
  }

  async login(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError("E-mail ou senha incorretos");
    }

    const ismatch = await compararSenha(password, user.hashedPassword);

    if (!ismatch) {
      throw new UnauthorizedError("E-mail ou senha incorretos");
    }

    // Mantém o campo aninhado como "email.endereço"
    const token = criarToken({
      id: user._id,
      email: user.email?.endereco || "",
    });

    return { user, token };
  }

  async createUserAndToken(userData) {
    const { name, number, email, password } = userData;

    if (!name || !number || !email || !password) {
      throw new ValidationError("Preencha todos os campos");
    }

    const validation = validateData(name, number, email, password);
    if (!validation.valid) {
      throw new ValidationError(validation.message);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await this.verifiedUser({ email: normalizedEmail });
    if (existing) {
      throw new ValidationError("Este e-mail já está em uso");
    }

    const hashedPassword = await criarHashPass(password);

    const newUser = await this.createUser({
      name,
      number,
      email,
      hashedPassword,
    });

    const token = criarToken({
      _id: newUser.insertedId,
      email: normalizedEmail,
    });

    const dataUser = await this.getUserById(newUser.insertedId);

    return { token, user: dataUser };
  }

  async verifyNumber(number) {
    if (!number) {
      throw new ValidationError("Número de telefone não fornecido.");
    }
    return await sendCodeWhatzapp(number);
  }

  async verifyCode(number, code) {
    const otps = await verifyCodeSend(number, code);
    if (code === otps.code) {
      return otps;
    }
    throw new UnauthorizedError("Código incorreto.");
  }

  async addToFavorites(userId, productId) {
    if (!ObjectId.isValid(userId)) throw new ValidationError("ID de usuário inválido.");
    if (!ObjectId.isValid(productId)) throw new ValidationError("ID de produto inválido.");

    const user = await this.getUserById(userId);
    const product = await productsController.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favorites: new ObjectId(productId) } },
    );

    if (result.modifiedCount === 0) {
      throw new ValidationError("Produto já está nos favoritos.");
    }
    const updatedUser = await this.getUserById(userId);
    return updatedUser;
  }

  async removeFromFavorites(userId, productId) {
    if (!ObjectId.isValid(userId)) throw new ValidationError("ID de usuário inválido.");
    if (!ObjectId.isValid(productId)) throw new ValidationError("ID de produto inválido.");

    // Primeiro, verifica se o usuário existe
    await this.getUserById(userId);

    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: new ObjectId(productId) } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundError("Produto não encontrado nos favoritos.");
    }

    return await this.getUserById(userId);
  }

  async addToCarrinho(userId, productId) {
    if (!ObjectId.isValid(userId)) throw new ValidationError("ID de usuário inválido.");
    if (!ObjectId.isValid(productId)) throw new ValidationError("ID de produto inválido.");

    await this.getUserById(userId);
    const product = await productsController.getProductById(productId);
    if (!product || product.length === 0) {
      throw new NotFoundError("Produto não encontrado.");
    }

    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { cart: new ObjectId(productId) } },
    );

    if (result.modifiedCount === 0) {
      throw new ValidationError("Produto já está no carrinho.");
    }

    const updatedUser = await this.getUserById(userId);
    return updatedUser;
  }

  async removeFromCarrinho(userId, productId) {
    try {
      const userIdStr = String(userId).trim();
      const productIdStr = String(productId).trim();

      if (!ObjectId.isValid(userIdStr)) throw new ValidationError("ID de usuário inválido.");
      if (!productIdStr) throw new ValidationError("ID de produto inválido.");

      const before = await this.getCollection().findOne(
        { _id: new ObjectId(userIdStr) },
        { projection: { cart: 1 } },
      );
      // tenta remover tanto ObjectId quanto string no mesmo $pull usando $in
      const pullValues = [];
      if (ObjectId.isValid(productIdStr)) pullValues.push(new ObjectId(productIdStr));
      pullValues.push(productIdStr);

      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(userIdStr) },
        { $pull: { cart: { $in: pullValues } } },
      );

      if (result.modifiedCount === 0) {
        throw new NotFoundError("Produto não encontrado no carrinho.");
      }

      const after = await this.getCollection().findOne(
        { _id: new ObjectId(userIdStr) },
        { projection: { cart: 1 } },
      );
      
      return await this.getUserById(userIdStr);
    } catch (err) {
      console.error("[removeFromCarrinho] erro:", err);
      throw err;
    }
  }

}
