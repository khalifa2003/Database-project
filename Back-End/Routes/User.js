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

// Get all information about the user
router.get("/", (req, res) => {
  connection.query(
    `
  SELECT
    u.id AS user_id,
    u.username,
    u.email,
    u.fname AS first_name,
    u.lname AS last_name,
    p.phone,
    a.city,
    a.street,
    a.house_num,
    a.postal_code
  FROM
    users u
  LEFT JOIN
    phone p ON u.id = p.user_id
  LEFT JOIN
    address a ON u.id = a.user_id;
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

// Add a new User
router.post("/", (req, res) => {
  const { username, email, fname, lname, phone, password } = req.body;
  connection.query(
    `INSERT INTO users VALUES (null,'${username}','${email}','${fname}','${lname}','${password}');`,
    (err, results) => {
      if (err) {
        console.error("Error adding Brand:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      connection.query(
        `INSERT INTO phone VALUES (null,${results.insertId},'${phone}');`,
        (err, results) => {}
      );
      res.status(201).json({
        id: results.insertId,
        username,
        email,
        fname,
        lname,
        phone,
      });
    }
  );
});
// Add a new address
router.post("/address", (req, res) => {
  const { user_id, city, street, house_num, postal_code,town } = req.body;
  connection.query(
    `INSERT INTO address VALUES (null,${user_id},'${city}','${town}','${street}','${house_num}','${postal_code}')`,
    (err, results) => {
      if (err) {
        console.error("Error adding Brand:", err);
        res.status(500).json({ error: `Internal Server Error` });
        return;
      }
      res.status(201).json({
        id: results.insertId,
        user_id,
        city,
        street,
        house_num,
        postal_code,
      });
    }
  );
});

module.exports = router;
