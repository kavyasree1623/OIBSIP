const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
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

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Veg", "Non-Veg"],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    sizes: {
      small: {
        type: Number,
        required: true,
        min: 0,
      },

      medium: {
        type: Number,
        required: true,
        min: 0,
      },

      large: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    crusts: {
      type: [optionSchema],
      default: [],
    },

    sauces: {
      type: [optionSchema],
      default: [],
    },

    vegToppings: {
      type: [optionSchema],
      default: [],
    },

    nonVegToppings: {
      type: [optionSchema],
      default: [],
    },

    cheeseOptions: {
      type: [optionSchema],
      default: [],
    },

    available: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

const Pizza = mongoose.model("Pizza", pizzaSchema);

module.exports = Pizza;