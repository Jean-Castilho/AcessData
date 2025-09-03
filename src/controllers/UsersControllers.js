import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import { validateData } from '../services/validationService.js';
import { criarToken, criarHashPass, compararSenha } from '../config/auth.js';
import { sendCodeWhatzapp, verifyCodeSend } from "./WhatzappController.js";

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
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    const user = await this.getCollection().findOne({ _id: objectId });

    if (!user) {
      // Retornar null permite que a camada de rota decida o que fazer.
      return null;
    }
    return user;
  }

  async getUsers() {
    const users = await this.getCollection().find().toArray();
    return users;
  }

  // Busca usuário pelo email (campo aninhado email.endereço)
  async getUserByEmail(email) {
    if (!email) return null;
    return await this.getCollection().findOne({ "email.endereço": email });
  }

  // cria usuário salvando telefone em number.telefone
  async createUser({ name, number, email, hashedPassword }) {

    const dataUser = {
      name,
      number: { verified: false, telefone: number, otps: {} },
      email: { verified: false, endereço: email, otps: {} },
      hashedPassword,
    };
    return await this.getCollection().insertOne(dataUser);
  }

  async verifiedUser({ email, number } = {}) {
    const query = {};
    if (email) query["email.endereço"] = email;
    if (number) query["number.telefone"] = number;
    if (Object.keys(query).length === 0) return null;
    const user = await this.getCollection().findOne(query);
    return user;
  }

  async updateUser(id, updatedUser) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    return await this.getCollection().updateOne(
      { _id: objectId },
      { $set: updatedUser }
    );
  }

  async deleteUser(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    return await this.getCollection().deleteOne({ _id: objectId });
  }

  async login(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error("Usuario nao encontrado");
    }

    const ismatch = await compararSenha(
      password,
      user.hashedPassword
    );

    if (!ismatch) {
      throw new Error("Senha incorreta");
    }

    // Mantém o campo aninhado como "email.endereço"
    const token = criarToken(
      { id: user._id, email: user.email?.endereço || "" }
    );

    return { user, token };
  }

  async createUserAndToken(userData) {
    const { name, number, email, password } = userData;

    if (!name || !number || !email || !password) {
      throw new Error("Preencha todos os campos");
    }

    const validation = validateData(name, number, email, password);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const existing = await this.verifiedUser({ email });
    if (existing) {
      throw new Error("Usuario ja existe");
    }

    const hashedPassword = await criarHashPass(password);

    const newUser = await this.createUser({
      name,
      number,
      email,
      hashedPassword,
    });

    const token = criarToken(
      { _id: newUser.insertedId, email: email }
    );

    const dataUser = await this.getUserById(newUser.insertedId);

    return { token, user: dataUser };
  }

  async verifyNumber(number) {
    if (!number) {
      throw new Error("Número de telefone não fornecido.");
    }
    return await sendCodeWhatzapp(number);
  }

  async verifyCode(number, code) {
    const otps = await verifyCodeSend(number, code);
    if (code === otps.code) {
      return otps;
    }
    throw new Error("Código incorreto.");
  }
}