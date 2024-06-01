const express = require("express");

const usersRouter = require("./users");
const adminRouter = require("./admin");
const supplierRouter = require("./supplier");
const productRouter = require("./products");
const orderRouter = require("./orders");

const router = express();

router.use("/users", usersRouter);
router.use("/admin", adminRouter);
router.use("/supplier", supplierRouter);
router.use("/products", productRouter);
router.use("/orders", orderRouter);

module.exports = router;
