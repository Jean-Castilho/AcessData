import publicRoutes from "./routes/public.js";
import productRoutes from "./routes/products.js";
import privacyRoutes from "./routes/privacy.js";
import whatzappRoutes from "./routes/whatzapp.js";
import ordersRoutes from "./routes/orders.js";

import auth from "./config/auth.js";

const Server = function (app) {
  // Rotas da aplicação

  app.use("/privacy", privacyRoutes);
  app.use("/orders", ordersRoutes);
  app.use("/public", publicRoutes);
  app.use("/products", productRoutes);
  app.use("/whatzapp", whatzappRoutes);
};

export default Server;
