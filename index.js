import express from "express";
import cors from "cors";
import Server from "./src/Server.js";

const app = express();

app.use(cors()); // Adicione o middleware CORS aqui
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3300;

Server(app, PORT);