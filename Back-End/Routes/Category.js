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

// Get all categories
router.get("/", (req, res) => {
  connection.query(`SELECT * FROM categories`, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Get a single category by ID
router.get("/:id", (req, res) => {
  const categoryId = req.params.id;
  connection.query(
    `SELECT * FROM categories WHERE id = ${categoryId};`,
    (err, results) => {
      if (err) {
        console.error("Error fetching category:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "Category not found" });
      } else {
        res.json(results[0]);
      }
    }
  );
});

// Add a new category
router.post("/", (req, res) => {
  const { name, img , description } = req.body;
  connection.query(
    `INSERT INTO categories VALUES 
    (null,"${name}","${description}",'${img}')`,
    (err, results) => {
      if (err) {
        console.error("Error adding category:", err);
        res.status(500).json({ error: `Internal Server Error ${name}` });
        return;
      }
      res.status(201).json({ id: results.insertId, name });
    }
  );
});

module.exports = router;
