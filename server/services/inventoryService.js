const Order = require("../models/Order");
const InventoryItem = require("../models/InventoryItem");

const groupedConsumptions = (consumptions = []) => {
  const grouped = new Map();
  for (const entry of consumptions) {
    const key = `${entry.category}\u0000${entry.name}`;
    grouped.set(key, { category: entry.category, name: entry.name, quantity: (grouped.get(key)?.quantity || 0) + entry.quantity });
  }
  return [...grouped.values()];
};

const deductInventoryForOrder = async (orderId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, inventoryDeducted: { $ne: true }, inventoryDeductionInProgress: { $ne: true } },
    { $set: { inventoryDeductionInProgress: true } },
    { new: true }
  );
  if (!order) {
    const current = await Order.findById(orderId);
    if (current?.inventoryDeducted) return current;
    throw new Error("Inventory deduction is already running or the order is unavailable.");
  }

  const changed = [];
  try {
    for (const requirement of groupedConsumptions(order.inventoryConsumptions)) {
      const item = await InventoryItem.findOneAndUpdate(
        { category: requirement.category, name: requirement.name, quantity: { $gte: requirement.quantity } },
        { $inc: { quantity: -requirement.quantity } },
        { new: true }
      );
      if (!item) throw new Error(`Insufficient or unconfigured stock: ${requirement.name}.`);
      changed.push(requirement);
    }
    order.inventoryDeducted = true;
    order.inventoryDeductionInProgress = false;
    await order.save();
    return order;
  } catch (error) {
    for (const entry of changed.reverse()) {
      await InventoryItem.updateOne({ category: entry.category, name: entry.name }, { $inc: { quantity: entry.quantity } });
    }
    await Order.updateOne({ _id: orderId }, { $set: { inventoryDeductionInProgress: false } });
    throw error;
  }
};

const restoreInventoryForOrder = async (orderId) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, inventoryDeducted: true, inventoryRestored: { $ne: true } },
    { $set: { inventoryRestored: true } },
    { new: true }
  );
  if (!order) return;
  const restored = [];
  try {
    for (const entry of groupedConsumptions(order.inventoryConsumptions)) {
      await InventoryItem.updateOne({ category: entry.category, name: entry.name }, { $inc: { quantity: entry.quantity } });
      restored.push(entry);
    }
  } catch (error) {
    for (const entry of restored.reverse()) {
      await InventoryItem.updateOne({ category: entry.category, name: entry.name }, { $inc: { quantity: -entry.quantity } });
    }
    await Order.updateOne({ _id: orderId }, { $set: { inventoryRestored: false } });
    throw error;
  }
};

module.exports = { deductInventoryForOrder, restoreInventoryForOrder };
