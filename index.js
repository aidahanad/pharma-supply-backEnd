const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
require("dotenv").config();
require("./config/db");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(upload.any()); // Allow any files to be uploaded
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//Routes
const routesV1 = require("./routes/index");

const api = process.env.API_URL;

app.use(api, routesV1);

//Server
app.listen(process.env.PORT, () => {
  console.log(`server is running http://localhost:${process.env.PORT}`);
});
