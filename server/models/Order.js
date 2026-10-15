const mongoose = require("mongoose");

const customizationOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      enum: ["small", "medium", "large"],
    },

    crust: {
      type: customizationOptionSchema,
      required: true,
    },

    sauce: {
      type: customizationOptionSchema,
      required: true,
    },

    toppings: {
      type: [customizationOptionSchema],
      default: [],
    },

    extraCheese: {
      type: Boolean,
      default: false,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    inventoryConsumptions: {
      type: [{ category: String, name: String, quantity: Number }],
      default: [],
    },
    inventoryDeducted: { type: Boolean, default: false },
    inventoryDeductionInProgress: { type: Boolean, default: false },
    inventoryRestored: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
