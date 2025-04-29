import express from "express";
import Server from "./src/Server.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3300;

Server(app, express, PORT)