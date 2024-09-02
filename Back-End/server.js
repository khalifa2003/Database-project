const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const CategoryRoutes = require("./Routes/Category");
const BrandRoutes = require("./Routes/Brand");
const ProductRoutes = require("./Routes/Product");
const OrdersRoutes = require("./Routes/Order");
const CartsRoutes = require("./Routes/Cart");
const UsersRoutes = require("./Routes/User");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config({ path: "config.env" });
// express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;
// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "egystore",
});
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL!");
  }
});
// Use route files
app.use("/categories", CategoryRoutes);
app.use("/brands", BrandRoutes);
app.use("/products", ProductRoutes);
app.use("/orders", OrdersRoutes);
app.use("/carts", CartsRoutes);
app.use("/users", UsersRoutes);

app.listen(PORT, (req, res) => {
  console.log("listening on port " + PORT);
});
