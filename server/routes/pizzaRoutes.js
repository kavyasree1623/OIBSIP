const express = require("express");

const {
  getPizzas,
  getAllPizzasAdmin,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} = require("../controllers/pizzaController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Keep this route before /:id
router.get("/admin/all", protect, adminOnly, getAllPizzasAdmin);

// Public routes
router.get("/", getPizzas);
router.get("/:id", getPizzaById);

// Admin-only routes
router.post("/", protect, adminOnly, createPizza);
router.put("/:id", protect, adminOnly, updatePizza);
router.delete("/:id", protect, adminOnly, deletePizza);

module.exports = router;