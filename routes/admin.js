const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// Login route
router.post("/login", adminController.loginAdmin);

// Accept supplier route
router.put("/supplier/:id/accept", adminController.acceptSupplier);

// Accept user route
router.put("/user/:id/accept", adminController.acceptUser);

// Ban user route
router.put("/ban/user/:id", adminController.banUser);

// Create admin route
router.post("/", adminController.createAdmin); 

module.exports = router;

