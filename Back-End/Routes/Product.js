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

// Get all products
router.get("/", (req, res) => {
  const sql = `
  SELECT 
    products.*, 
    product_img.img 
  FROM products 
  LEFT JOIN 
    product_img ON products.id = product_img.product_id 
    GROUP BY products.id;`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Get a single product by ID
router.get("/:id", (req, res) => {
  const productId = req.params.id;
  const sql = `
  SELECT 
	products.*,
	GROUP_CONCAT(product_img.img) AS img,
	categories.name as category_name,
	brands.name as brand_name
		FROM products
			LEFT JOIN product_img ON products.id = product_img.product_id
			LEFT JOIN categories ON products.category_id = categories.id
			LEFT JOIN brands ON products.brand_id = brands.id
			WHERE products.id = ${productId}
			GROUP BY products.id
      `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching product data from MySQL:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Product not found");
    } else {
      const productData = results[0];
      productData.img = productData.img ? productData.img.split(",") : [];
      res.json(productData);
    }
  });
});

// Add a new product
router.post("/", (req, res) => {
  const {
    name,
    price,
    description,
    rate,
    img1,
    img2,
    img3,
    category_id,
    brand_id,
  } = req.body;
  const sql = `INSERT INTO products VALUES (NULL, '${name}', ${price}, '${description}', ${rate}, ${brand_id}, ${category_id});`;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error adding product:", err);
      res.status(500).json({ error: `Internal Server Error` });
      return;
    }
    const id = results.insertId;
    connection.query(
      `INSERT INTO product_img VALUES (NULL, '${img1}',${id}) , (NULL, '${img2}',${id}) ,  (NULL, '${img3}',${id});`,
      (err, results) => {
        if (err) {
          console.error("Error adding product:", err);
          res.status(500).json({ error: `Internal Server Error` });
          return;
        }
      }
    );

    res.status(201).json({
      id: results.insertId,
      name,
      price,
      description,
      category_id,
      brand_id,
    });
  });
});

// Update a products by ID
router.put("/:id", (req, res) => {
  const productId = req.params.id;
  const {
    name,
    price,
    description,
    imgURL,
    imgURL2,
    imgURL3,
    category_id,
    brand_id,
  } = req.body;
  connection.query(
    "UPDATE products SET " +
      (name ? "name='" + name + "'" : "") +
      (price ? "price='" + price : "") +
      (description ? "description='" + description : "") +
      (imgURL ? "imgURL='" + imgURL : "") +
      (imgURL2 ? "imgURL2='" + imgURL2 : "") +
      (imgURL3 ? "imgURL3='" + imgURL3 : "") +
      (category_id ? "category_id='" + category_id : "") +
      (brand_id ? "brand_id='" + brand_id : "") +
      "WHERE id = + " +
      productId,
    (err) => {
      if (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json({ id: productId });
    }
  );
});

// Delete a product by ID
router.delete("/:id", (req, res) => {
  const productId = req.params.id;
  const deleteReview = `DELETE FROM review WHERE product_id = ${productId};`;
  const deleteOrder_line = `DELETE FROM order_line WHERE product_id = ${productId};`;
  const deleteProduct_img = `DELETE FROM product_img WHERE product_id = ${productId};`;
  const deleteCart_item = `DELETE FROM cart_item WHERE product_id = ${productId};`;
  const deleteProduct = `DELETE FROM products WHERE id = ${productId};`;
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    connection.query(deleteReview, [productId], (err) => {
      if (err) {
        connection.rollback(() => {
          console.error("Error deleting reviews:", err);
          res.status(500).json({ error: "Internal Server Error" });
        });
        return;
      }
      connection.query(deleteOrder_line, [productId], (err) => {
        if (err) {
          connection.rollback(() => {
            console.error("Error deleting product images:", err);
            res.status(500).json({ error: "Internal Server Error" });
          });
          return;
        }
        connection.query(deleteProduct_img, [productId], (err) => {
          if (err) {
            connection.rollback(() => {
              console.error("Error deleting product:", err);
              res.status(500).json({ error: "Internal Server Error" });
            });
            return;
          }
          connection.query(deleteCart_item, [productId], (err) => {
            if (err) {
              connection.rollback(() => {
                console.error("Error deleting product:", err);
                res.status(500).json({ error: "Internal Server Error" });
              });
              return;
            }
            connection.query(deleteProduct, [productId], (err) => {
              if (err) {
                connection.rollback(() => {
                  console.error("Error deleting product:", err);
                  res.status(500).json({ error: "Internal Server Error" });
                });
                return;
              }
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    console.error("Error committing transaction:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                  });
                  return;
                }
                res.json({ message: "Product deleted successfully" });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
