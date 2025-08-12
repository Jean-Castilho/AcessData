import publicRoutes from "./routes/public.js";
import productRoutes from "./routes/products.js";
import privacyRoutes from "./routes/privacy.js";

import auth from "./config/auth.js";

const Server = function (app, PORT) {

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.use("/privacy", auth, privacyRoutes);
  app.use("/public", publicRoutes);
  app.use("/products", productRoutes);

  app.listen(PORT, () => {
    console.log(`Servidor rodando: http://localhost:${PORT}`);
  });
};

export default Server;
