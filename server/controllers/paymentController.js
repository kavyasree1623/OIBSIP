const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");

// Create Razorpay order using MongoDB order
const createRazorpayOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: "Razorpay test credentials are not configured." });
    }
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pay for this order",
      });
    }

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "This order is not an online payment order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      orderId: order._id.toString(),
      amount: order.totalAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};


// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // Find the MongoDB order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure the order belongs to the logged-in user
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this order",
      });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match this order",
      });
    }

    // Create the signature that Razorpay expects
    if (!process.env.RAZORPAY_KEY_SECRET || !/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare Razorpay signature with our generated signature
    const generatedBytes = Buffer.from(generatedSignature, "hex");
    const receivedBytes = Buffer.from(razorpay_signature, "hex");
    if (generatedBytes.length !== receivedBytes.length || !crypto.timingSafeEqual(generatedBytes, receivedBytes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Payment is verified
    order.paymentStatus = "Paid";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
