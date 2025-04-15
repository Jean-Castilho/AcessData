import users from "./routes/users.js";
import products from "./routes/products.js";

const Server = function (express, PORT) {
  const app = express();

  app.use(express.json());
  app.use(express.static("public"));

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  app.use("/users", users);
  app.use("/products", products);

  app.listen(PORT, () => {
    console.log(`Servidor rodandno: http://localhost/${PORT}`);
  });
};

export default Server;
