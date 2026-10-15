const mongoose = require("mongoose");
const Pizza = require("../models/Pizza");

const hasValidPrices = (payload, existing = {}) => {
  const sizes = { ...(existing.sizes?.toObject?.() || existing.sizes || {}), ...(payload.sizes || {}) };
  const price = payload.price ?? existing.price;
  return [sizes.small, sizes.medium, sizes.large, price]
    .every((value) => Number.isFinite(Number(value)) && Number(value) > 0);
};

const hasBuilderOptions = (payload, existing = {}) => {
  const crusts = payload.crusts ?? existing.crusts ?? [];
  const sauces = payload.sauces ?? existing.sauces ?? [];
  return crusts.length >= 5 && sauces.length >= 5;
};

// GET /api/pizzas
// Public: return only available pizzas
const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find({ available: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("getPizzas error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas",
    });
  }
};

// GET /api/pizzas/admin/all
// Admin: return all pizzas, including unavailable ones
const getAllPizzasAdmin = async (req, res) => {
  try {
    const pizzas = await Pizza.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("getAllPizzasAdmin error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin pizzas",
    });
  }
};

// GET /api/pizzas/:id
const getPizzaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      pizza,
    });
  } catch (error) {
    console.error("getPizzaById error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizza",
    });
  }
};

// POST /api/pizzas
const createPizza = async (req, res) => {
  try {
    if (!hasValidPrices(req.body)) {
      return res.status(400).json({ success: false, message: "Pizza and size prices must be valid amounts greater than zero." });
    }
    if (!hasBuilderOptions(req.body)) {
      return res.status(400).json({ success: false, message: "Add at least five base and five sauce options for the custom pizza builder." });
    }
    const pizza = await Pizza.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Pizza created successfully",
      pizza,
    });
  } catch (error) {
    console.error("createPizza error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to create pizza",
      error: error.message,
    });
  }
};

// PUT /api/pizzas/:id
const updatePizza = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const existingPizza = await Pizza.findById(id);
    if (!existingPizza) {
      return res.status(404).json({ success: false, message: "Pizza not found" });
    }
    if (!hasValidPrices(req.body, existingPizza)) {
      return res.status(400).json({ success: false, message: "Pizza and size prices must be valid amounts greater than zero." });
    }
    if (!hasBuilderOptions(req.body, existingPizza)) {
      return res.status(400).json({ success: false, message: "Keep at least five base and five sauce options for the custom pizza builder." });
    }

    const pizza = await Pizza.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza updated successfully",
      pizza,
    });
  } catch (error) {
    console.error("updatePizza error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to update pizza",
      error: error.message,
    });
  }
};

// DELETE /api/pizzas/:id
const deletePizza = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const pizza = await Pizza.findByIdAndDelete(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza deleted successfully",
    });
  } catch (error) {
    console.error("deletePizza error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete pizza",
    });
  }
};

module.exports = {
  getPizzas,
  getAllPizzasAdmin,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
};
