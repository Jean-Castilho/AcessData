import express from "express";
import Server from "./src/Server.js";

const PORT = process.env.PORT || 3300;

Server(express, PORT);