const express = require("express");
const { getInventory, saveInventoryItem } = require("../controllers/inventoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, adminOnly);
router.get("/", getInventory);
router.post("/", saveInventoryItem);

module.exports = router;
