const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer routes
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);

module.exports = router;