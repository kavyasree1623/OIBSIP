const InventoryItem = require("../models/InventoryItem");
const mailer = require("../config/mailer");

const runLowStockCheck = async () => {
  const recipient = process.env.LOW_STOCK_ALERT_EMAIL;
  if (!recipient || !process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return;
  const candidates = await InventoryItem.find({ $expr: { $lte: ["$quantity", "$lowStockThreshold"] }, alertSent: false });
  const lowItems = [];
  for (const candidate of candidates) {
    const claimed = await InventoryItem.findOneAndUpdate(
      { _id: candidate._id, alertSent: false, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } },
      { $set: { alertSent: true } },
      { new: true }
    );
    if (claimed) lowItems.push(claimed);
  }
  if (!lowItems.length) return;
  const lines = lowItems.map((item) => `${item.category}: ${item.name} — ${item.quantity} remaining (threshold ${item.lowStockThreshold})`).join("\n");
  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipient,
      subject: "PizzaGo low-stock alert",
      text: `The following ingredients are at or below their configured threshold:\n\n${lines}`,
    });
  } catch (error) {
    await InventoryItem.updateMany({ _id: { $in: lowItems.map((item) => item._id) } }, { $set: { alertSent: false } });
    throw error;
  }
};

const startLowStockScheduler = () => {
  const intervalMinutes = Math.max(1, Number(process.env.LOW_STOCK_CHECK_INTERVAL_MINUTES) || 5);
  const timer = setInterval(() => {
    runLowStockCheck().catch((error) => console.error("Low-stock check failed:", error.message));
  }, intervalMinutes * 60 * 1000);
  runLowStockCheck().catch((error) => console.error("Low-stock check failed:", error.message));
  return timer;
};

module.exports = { startLowStockScheduler };
