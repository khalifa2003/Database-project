const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "egystore",
});

// Get all cart
router.get("/", (req, res) => {
  connection.query(
    `
    SELECT
    ci.id AS cart_item_id,
    c.id AS cart_id,
    u.id AS user_id,
    u.username,
    p.name AS product_name,
    p.price AS product_price,
    pi.img AS product_img,
    ci.quantity,
    b.name AS brand_name,
    cat.name AS category_name
  FROM
    cart_item ci
  JOIN
    carts c ON ci.cart_id = c.id
  JOIN
    users u ON c.user_id = u.id
  JOIN
    products p ON ci.product_id = p.id
  JOIN
    product_img pi ON p.id = pi.product_id
  JOIN
    brands b ON p.brand_id = b.id
  JOIN
    categories cat ON p.category_id = cat.id
  GROUP BY p.price;
    `,
    (err, results) => {
      if (err) {
        console.error("Error fetching carts:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results);
    }
  );
});

// Get a single Brand by ID
router.get("/:id", (req, res) => {
  const cartId = req.params.id;
  connection.query(
    `
  SELECT
    ci.id AS cart_item_id,
    c.id AS cart_id ,
    u.id AS user_id,
    u.username,
    p.name AS product_name,
    p.price AS product_price,
    pi.img AS product_img,
    ci.quantity,
    b.name AS brand_name,
    cat.name AS category_name
  FROM
    cart_item ci
  JOIN
    carts c ON ci.cart_id = ${cartId}
  JOIN
    users u ON c.user_id = u.id
  JOIN
    products p ON ci.product_id = p.id
  JOIN
    product_img pi ON p.id = pi.product_id
  JOIN
    brands b ON p.brand_id = b.id
  JOIN
    categories cat ON p.category_id = cat.id
  GROUP BY p.price;`,
    (err, results) => {
      if (err) {
        console.error("Error fetching Cart:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "Cart not found" });
      } else {
        res.json(results);
      }
    }
  );
});
module.exports = router;
