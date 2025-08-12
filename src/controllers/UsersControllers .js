import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import Services from "../models/Services.js";

dotenv.config();

export default class UsersControllers {
  constructor() {
    this.uri = process.env.DATABASE_URL;
    this.client = getDataBase();
    this.service = Services;
    this.database = this.client;
    this.users = this.database.collection("users");
  }

  async getUserById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const objectId = new ObjectId(id);
    const user = await this.users.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "Usuario não encontrado" });
    }
    return user;
  }

  async getUsers() {
    const users = await this.users.find().toArray();
    return users;
  }

  async createUser({ name, number, email, hashedPassword, }) {
    const dataUser = { name, number, email, hashedPassword };
    return await this.users.insertOne(dataUser);
  }

  async getUserByEmail(email) {
    const user = await this.users.findOne({ email });
    return user;
  }

  async updateUser(id, updatedUser) {
    return (result = await this.users.updateOne(
      { _id: id },
      { $set: updatedUser }
    ));
  }

  async deleteUser(id) {
    return (result = await this.users.deleteOne({ _id: id }));
  }

}
