const mongoose = require("mongoose");
const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const { deductInventoryForOrder, restoreInventoryForOrder } = require("../services/inventoryService");

// Find a customization option by name
const findOption = (options, selectedName) => {
  return options.find(
    (option) => option.name === selectedName
  );
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      phone,
      paymentMethod = "COD",
    } = req.body;

    // Validate basic order information
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one pizza",
      });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate payment method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    let totalAmount = 0;
    const orderItems = [];
    const inventoryConsumptions = [];

    // Validate and process every item
    for (const item of items) {
      // Validate pizza ID
      if (!item.pizza) {
        return res.status(400).json({
          success: false,
          message: "Pizza ID is required for every order item",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.pizza)) {
        return res.status(400).json({
          success: false,
          message: "Invalid pizza ID",
        });
      }

      // Validate size
      if (!["small", "medium", "large"].includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: "Invalid pizza size",
        });
      }

      // Validate quantity
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive whole number",
        });
      }

      // Get pizza from database
      const pizza = await Pizza.findById(item.pizza);

      if (!pizza) {
        return res.status(404).json({
          success: false,
          message: `Pizza not found: ${item.pizza}`,
        });
      }

      if (!pizza.available) {
        return res.status(400).json({
          success: false,
          message: `${pizza.name} is currently unavailable`,
        });
      }

      // Get base price from database
      const basePrice = pizza.sizes[item.size];

      if (basePrice === undefined) {
        return res.status(400).json({
          success: false,
          message: `Price not available for ${pizza.name} (${item.size})`,
        });
      }

      // Validate crust
      if (!item.crust) {
        return res.status(400).json({
          success: false,
          message: `Crust is required for ${pizza.name}`,
        });
      }

      const selectedCrust = findOption(
        pizza.crusts,
        item.crust
      );

      if (!selectedCrust) {
        return res.status(400).json({
          success: false,
          message: `Invalid crust selected for ${pizza.name}`,
        });
      }

      // Validate sauce
      if (!item.sauce) {
        return res.status(400).json({
          success: false,
          message: `Sauce is required for ${pizza.name}`,
        });
      }

      const selectedSauce = findOption(
        pizza.sauces,
        item.sauce
      );

      if (!selectedSauce) {
        return res.status(400).json({
          success: false,
          message: `Invalid sauce selected for ${pizza.name}`,
        });
      }

      // Validate toppings
      const selectedToppings = item.toppings || [];

      if (!Array.isArray(selectedToppings)) {
        return res.status(400).json({
          success: false,
          message: `Invalid toppings for ${pizza.name}`,
        });
      }

      const availableToppings = [
        ...(pizza.vegToppings || []),
        ...(pizza.nonVegToppings || []),
      ];

      const validatedToppings = [];

      for (const topping of selectedToppings) {
        const toppingName =
          typeof topping === "string"
            ? topping
            : topping.name;

        const selectedTopping = findOption(
          availableToppings,
          toppingName
        );

        if (!selectedTopping) {
          return res.status(400).json({
            success: false,
            message: `Invalid topping selected: ${toppingName}`,
          });
        }

        validatedToppings.push({
          name: selectedTopping.name,
          price: selectedTopping.price,
        });
        if ((pizza.vegToppings || []).some((option) => option.name === selectedTopping.name)) {
          inventoryConsumptions.push({ category: "vegetable", name: selectedTopping.name, quantity: item.quantity });
        }
      }

      // Validate extra cheese
      const extraCheese = Boolean(item.extraCheese);

      let cheesePrice = 0;

      if (extraCheese) {
        const selectedCheese = findOption(
          pizza.cheeseOptions || [],
          "Extra Cheese"
        );

        if (!selectedCheese) {
          return res.status(400).json({
            success: false,
            message: `Extra cheese is not available for ${pizza.name}`,
          });
        }

        cheesePrice = selectedCheese.price;
      }

      // Calculate complete pizza price on the server
      const singlePizzaPrice =
        basePrice +
        selectedCrust.price +
        selectedSauce.price +
        validatedToppings.reduce(
          (sum, topping) => sum + topping.price,
          0
        ) +
        cheesePrice;

      const itemTotal =
        singlePizzaPrice * item.quantity;

      totalAmount += itemTotal;
      inventoryConsumptions.push(
        { category: "base", name: selectedCrust.name, quantity: item.quantity },
        { category: "sauce", name: selectedSauce.name, quantity: item.quantity },
        { category: "cheese", name: "Cheese", quantity: item.quantity },
      );
      if (extraCheese) inventoryConsumptions.push({ category: "cheese", name: "Extra Cheese", quantity: item.quantity });

      // Store only database-verified values
      orderItems.push({
        pizza: pizza._id,
        name: pizza.name,
        size: item.size,

        crust: {
          name: selectedCrust.name,
          price: selectedCrust.price,
        },

        sauce: {
          name: selectedSauce.name,
          price: selectedSauce.price,
        },

        toppings: validatedToppings,

        extraCheese,

        quantity: item.quantity,

        price: singlePizzaPrice,
      });
    }

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),
      paymentMethod,
      inventoryConsumptions,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.pizza")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get a single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.pizza");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Admin can view any order.
    // Customers can only view their own orders.
    if (
      req.user.role !== "admin" &&
      order.user &&
      order.user._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Get all orders - Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.pizza")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Update order status - Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Placed",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["Cancelled", "Delivered"].includes(order.orderStatus) && orderStatus !== order.orderStatus) {
      return res.status(409).json({ success: false, message: "A cancelled or delivered order cannot be reopened." });
    }

    if (["Confirmed", "Preparing", "Out for Delivery", "Delivered"].includes(orderStatus) && order.paymentMethod === "ONLINE" && order.paymentStatus !== "Paid") {
      return res.status(400).json({ success: false, message: "An online order must be paid before it can be confirmed." });
    }
    let inventoryWarning = "";
    try {
      if (["Confirmed", "Preparing", "Out for Delivery", "Delivered"].includes(orderStatus)) {
        await deductInventoryForOrder(order._id);
      } else if (orderStatus === "Cancelled") {
        await restoreInventoryForOrder(order._id);
      }
    } catch (inventoryError) {
      inventoryWarning = ` Inventory needs attention: ${inventoryError.message}`;
    }

    let savedOrder;
    if (orderStatus === "Cancelled") {
      // A cancellation only changes the status. Update that path directly so
      // legacy order items are not revalidated against newer item requirements.
      savedOrder = await Order.findByIdAndUpdate(
        order._id,
        { $set: { orderStatus } },
        { new: true, runValidators: true }
      );
      if (!savedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
    } else {
      order.orderStatus = orderStatus;
      savedOrder = await order.save();
    }

    res.status(200).json({
      success: true,
      message: `Order status updated successfully.${inventoryWarning}`,
      inventoryWarning: inventoryWarning || null,
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
