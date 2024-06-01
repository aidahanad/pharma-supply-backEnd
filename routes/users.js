const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");

// Route to get all users
router.get("/", userController.getUsers);

// Route to get a user by ID
router.get("/:id", userController.getUserById);

// Route to update a user
router.put("/:id", userController.updateUser);

// Route to login a user
router.post("/login", userController.loginUser);

// Route to register a new user
router.post("/", userController.registerNewUser);

// Route to delete a user
router.delete("/:id", userController.deleteUser);

// Route to get the count of users
router.get("/get/count", userController.getCountOfUsers);

module.exports = router;
