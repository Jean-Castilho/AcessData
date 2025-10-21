import emailRoutes from "./routes/email.js";
import publicRoutes from "./routes/public.js";
import paymantRoutes from "./routes/paymant.js";
import productRoutes from "./routes/products.js";
import privacyRoutes from "./routes/privacy.js";
import whatzappRoutes from "./routes/whatzapp.js";
import ordersRoutes from "./routes/orders.js";

const Server = function (app) {
  // Rotas da aplicação

  app.use("/paymant", paymantRoutes);
  app.use("/email", emailRoutes);
  app.use("/privacy", privacyRoutes);
  app.use("/orders", ordersRoutes);
  app.use("/public", publicRoutes);
  app.use("/products", productRoutes);
  app.use("/whatzapp", whatzappRoutes);
};

export default Server;
