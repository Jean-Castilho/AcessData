import publicRoutes from "./routes/public.js";
import productRoutes from "./routes/products.js";
import privacyRoutes from "./routes/privacy.js";
import whatzappRoutes from "./routes/whatzapp.js";

import auth from "./config/auth.js";

const Server = function (app) {

  // Rotas da aplicação

  app.use("/privacy", auth, privacyRoutes);
  app.use("/public", publicRoutes);
  app.use("/products", productRoutes);
  app.use("/whatzapp", whatzappRoutes);
};

export default Server;
