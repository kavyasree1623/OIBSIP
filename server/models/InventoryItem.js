const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema({
  category: { type: String, enum: ["base", "sauce", "cheese", "vegetable"], required: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
  alertSent: { type: Boolean, default: false },
}, { timestamps: true });

inventoryItemSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
