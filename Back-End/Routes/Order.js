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

// Get all orders
router.get("/", (req, res) => {
  connection.query(
    `
  SELECT
    categories.name AS category_name,
    brands.name AS brand_name,
    products.rate,
    products.name AS product_name,
    order_line.quantity,
    (order_line.quantity * products.price) AS total_price,
    categories.id AS category_id,
    brands.id AS brand_id,
    orders.id AS order_id,
    products.id AS product_id,
    order_line.id AS order_line_id,
    product_img.img
  FROM
    order_line
  JOIN
    orders ON order_line.order_id = orders.id
  JOIN
    products ON order_line.product_id = products.id
  JOIN
    categories ON products.category_id = categories.id
  JOIN
    brands ON products.brand_id = brands.id
  LEFT JOIN
    product_img ON products.id = product_img.product_id
    GROUP BY products.id;
  `,
    (err, results) => {
      if (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results);
    }
  );
});

// Get a single category by ID
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    `
  SELECT
    u.id AS user_id,
    u.username AS user_name,
    p.id AS product_id,
    pi.img AS product_img,
    p.rate AS product_rate,
    ol.quantity AS product_quantity,
    pr.price AS product_price,
    o.id AS order_id,
    ol.id AS order_line,
    p.name
FROM
    orders o
JOIN
    users u ON o.user_id = 1
JOIN
    order_line ol ON o.id = ol.order_id
JOIN
    products p ON ol.product_id = p.id
JOIN
    product_img pi ON p.id = pi.product_id
JOIN
    products pr ON ol.product_id = pr.id
    group by order_line;
    `,
    (err, results) => {
      if (err) {
        console.error("Error fetching Orders:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "Order not found" });
      } else {
        res.json(results);
      }
    }
  );
});

// Delete a order by ID
router.delete("/:id", (req, res) => {
  const orderId = req.params.id;
  connection.query(
    `DELETE FROM order_line WHERE order_id = ${orderId}`,
    (err, results) => {
      if (err) {
        console.error("Error deleting order:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ error: "order not found" });
      } else {
        connection.query(
          `DELETE FROM orders WHERE id = ${orderId};`,
          (err, results) => {}
        );
        res.sendStatus(204);
      }
    }
  );
});

module.exports = router;
