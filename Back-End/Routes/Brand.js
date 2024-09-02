const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "egystore",
});

// Get all Brand
router.get("/", (req, res) => {
  connection.query(`SELECT * FROM brands`, (err, results) => {
    if (err) {
      console.error("Error fetching brands:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Get a single Brand by ID
router.get("/:id", (req, res) => {
  const brandId = req.params.id;
  connection.query(
    `SELECT * FROM brands WHERE id = ${brandId};`,
    (err, results) => {
      if (err) {
        console.error("Error fetching Brand:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "Brand not found" });
      } else {
        res.json(results[0]);
      }
    }
  );
});

// Add a new Brand
router.post("/", (req, res) => {
  const { name, img } = req.body;
  connection.query(
    `INSERT INTO brands VALUES (null,"${name}",'${img}')`,
    (err, results) => {
      if (err) {
        console.error("Error adding Brand:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      res.status(201).json({ id: results.insertId, name , img });
    }
  );
});

// Delete a Brand by ID
router.delete("/:id", (req, res) => {
  const brandId = req.params.id;
  connection.query(
    `DELETE FROM brands WHERE id = ${brandId}`,
    (err, results) => {
      if (err) {
        console.error("Error deleting brand:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ error: "Brand not found" });
      } else {
        res.sendStatus(204);
      }
    }
  );
});

module.exports = router;
