import usersRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import whatzappRoutes from "./routes/whatzapp.js";

const Server = function (app) {
  // Rotas da aplicação
  app.use("/users", usersRoutes);
  app.use("/products", productRoutes);
  app.use("/auth", authRoutes);
  app.use("/whatzapp", whatzappRoutes);
};

export default Server;
