import dotenv from "dotenv";
import { getDataBase } from "../config/db.js";

dotenv.config();

export default class UsersControllers {
  constructor() {
    this.uri = process.env.DATABASE_URL;
    this.client = getDataBase();
    this.database = this.client;
    this.users = this.database.collection("users");
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.users.findOne({ _id: id });
      if (!user) {
        return res.status(404).json({ message: "Usuario não encontrado" });
      }
      return user;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.users.find().toArray();
      return users;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const { name, number, email, password } = req.body;
      const newUser = { name, number, email, password };
      return await this.users.insertOne(newUser);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, number, email, password } = req.body;
      const updatedUser = { name, number, email, password };
      const result = await this.users.updateOne(
        { _id: id },
        { $set: updatedUser }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Usuario não encontrado" });
      }
      return res
        .status(200)
        .json({ message: "Usuario atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await this.users.deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Usuario não encontrado" });
      }
      return res.status(200).json({ message: "Usuario deletado com sucesso" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
