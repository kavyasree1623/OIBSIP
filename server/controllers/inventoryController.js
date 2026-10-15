const InventoryItem = require("../models/InventoryItem");

const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load inventory." });
  }
};

const saveInventoryItem = async (req, res) => {
  try {
    const { category, name, quantity, lowStockThreshold } = req.body;
    if (!["base", "sauce", "cheese", "vegetable"].includes(category) || !String(name || "").trim() ||
      !Number.isInteger(Number(quantity)) || Number(quantity) < 0 ||
      !Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
      return res.status(400).json({ success: false, message: "Enter a valid category, name, whole-number quantity, and threshold." });
    }
    const updates = { quantity: Number(quantity), lowStockThreshold: Number(lowStockThreshold) };
    if (Number(quantity) > Number(lowStockThreshold)) updates.alertSent = false;
    const item = await InventoryItem.findOneAndUpdate(
      { category, name: String(name).trim() },
      { $set: updates },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, item });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Unable to save inventory item." });
  }
};

module.exports = { getInventory, saveInventoryItem };
