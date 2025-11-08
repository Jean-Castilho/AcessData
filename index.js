import express from "express";
import cors from "cors";
import Server from "./src/Server.js";
import { connectDataBase, closeDataBase } from "./src/config/db.js";
import handleErrors from "./src/middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3300;

// Configuração de middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Middleware para capturar JSON malformado parse errors do body-parser/express
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("JSON inválido recebido:", err.message);
    return res
      .status(400)
      .json({ success: false, message: "JSON inválido na requisição" });
  }
  return next(err);
});

// Middleware de tratamento de erros (deve ser o último)
app.use(handleErrors);

// Função para iniciar o servidor de forma controlada
const start = async () => {
  try {
    // 1. Conecta ao banco de dados ANTES de iniciar o servidor
    await connectDataBase();

    // 2. Inicia o servidor Express para ouvir por requisições
    app.listen(PORT, () => {
      console.log(`Servidor rodando: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Falha ao iniciar a aplicação. O servidor não será iniciado.",
      error,
    );
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("Recebido sinal de encerramento. Fechando conexões...");
  await closeDataBase();
  process.exit(0);
});

// Inicia a aplicação
start();

// Configuração das rotas da aplicação
Server(app);
