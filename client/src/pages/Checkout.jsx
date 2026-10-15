import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import api from "../services/api";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    address: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setLoading(true);

      // Create order items
      const orderItems = cartItems.map((item) => ({
        pizza: item.pizzaId,
        size: item.size,
        crust: item.crust,
        sauce: item.sauce,
        toppings: item.toppings || [],
        extraCheese: item.extraCheese || false,
        quantity: item.quantity,
      }));

      // Step 1: Create MongoDB order
      const orderResponse = await api.post("/orders", {
        items: orderItems,
        deliveryAddress: formData.address.trim(),
        phone: formData.phone.trim(),
        paymentMethod,
      });

      const createdOrder = orderResponse.data.order;

      if (!createdOrder?._id) {
        throw new Error("Order could not be created.");
      }

      // COD flow
      if (paymentMethod === "COD") {
        clearCart();

        navigate(`/orders/${createdOrder._id}`);
        return;
      }

      // Step 2: Create Razorpay order
      const razorpayResponse = await api.post(
        "/payments/create-order",
        {
          orderId: createdOrder._id,
        }
      );

      const razorpayData = razorpayResponse.data;

      if (!razorpayData.success) {
        throw new Error(
          razorpayData.message ||
            "Unable to create Razorpay order."
        );
      }

      // Check Razorpay script
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page and try again."
        );
      }

      // Get logged-in user details
      const storedUser = localStorage.getItem("user");
      const user = storedUser
        ? JSON.parse(storedUser)
        : {};

      // Step 3: Razorpay Checkout configuration
      const options = {
        key: razorpayData.keyId,

        amount: razorpayData.razorpayOrder.amount,

        currency: razorpayData.razorpayOrder.currency,

        name: "PizzaGo",

        description: `PizzaGo Order #${createdOrder._id
          .toString()
          .slice(-8)
          .toUpperCase()}`,

        order_id: razorpayData.razorpayOrder.id,

        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: formData.phone.trim(),
        },

        theme: {
          color: "#C62828",
        },

        handler: async function (paymentResponse) {
          try {
            setError("");

            // Step 4: Verify payment on backend
            const verifyResponse = await api.post(
              "/payments/verify",
              {
                orderId: createdOrder._id,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              // Clear cart ONLY after successful verification
              clearCart();

              navigate(
                `/orders/${createdOrder._id}`
              );
            } else {
              setError(
                verifyResponse.data.message ||
                  "Payment verification failed."
              );

              setLoading(false);
            }
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error
            );

            setError(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);

            setError(
              "Payment was cancelled. Your order is still pending."
            );
          },
        },
      };

      // Step 5: Open Razorpay
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(
          "Razorpay payment failed:",
          response
        );

        setLoading(false);

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error(
        "Order/payment creation failed:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to process your order. Please try again.";

      setError(message);
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <ShoppingBag size={42} />

            <h1>Your cart is empty</h1>

            <p>
              Add a pizza to your cart before proceeding to
              checkout.
            </p>

            <Link
              to="/menu"
              className="checkout-primary-button"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <Link
            to="/cart"
            className="checkout-back-link"
          >
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <span>YOUR ORDER</span>

          <h1>Checkout</h1>

          <p>
            Enter your delivery details and choose your payment
            method.
          </p>
        </div>

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >
          <section className="checkout-details">
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>Delivery Details</h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="address">
                  Delivery address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="4"
                  placeholder="Enter your complete delivery address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="phone">
                  Phone number
                </label>

                <div className="checkout-input-wrapper">
                  <Phone size={18} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-card-icon">
                  <CreditCard size={20} />
                </div>

                <div>
                  <h2>Payment Method</h2>

                  <p>
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "COD"
                      ? "payment-option-active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />

                  <div className="payment-option-icon">
                    <Banknote size={21} />
                  </div>

                  <div>
                    <strong>Cash on Delivery</strong>

                    <span>
                      Pay when your order arrives
                    </span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "ONLINE"
                      ? "payment-option-active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />

                  <div className="payment-option-icon">
                    <CreditCard size={21} />
                  </div>

                  <div>
                    <strong>Online Payment</strong>

                    <span>
                      Pay securely using Razorpay
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <aside className="checkout-summary">
            <div className="checkout-summary-card">
              <h2>Order Summary</h2>

              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div
                    className="checkout-item"
                    key={item.customizationKey}
                  >
                    <div className="checkout-item-image-wrapper">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="checkout-item-image"
                      />

                      <span className="checkout-item-quantity">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="checkout-item-info">
                      <h3>{item.name}</h3>

                      <p>
                        {item.size
                          .charAt(0)
                          .toUpperCase() +
                          item.size.slice(1)}{" "}
                        · {item.crust}
                      </p>

                      {item.toppings?.length > 0 && (
                        <p>
                          {item.toppings
                            .map((topping) => topping.name)
                            .join(", ")}
                        </p>
                      )}

                      {item.extraCheese && (
                        <p>Extra cheese</p>
                      )}
                    </div>

                    <strong>
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="checkout-divider" />

              <div className="checkout-summary-row">
                <span>Subtotal</span>

                <strong>₹{cartTotal}</strong>
              </div>

              <div className="checkout-summary-row">
                <span>Delivery</span>

                <strong>Free</strong>
              </div>

              <div className="checkout-divider" />

              <div className="checkout-total">
                <span>Total</span>

                <strong>₹{cartTotal}</strong>
              </div>

              <button
                type="submit"
                className="checkout-place-button"
                disabled={loading}
              >
                {loading
                  ? paymentMethod === "ONLINE"
                    ? "Opening Payment..."
                    : "Placing Order..."
                  : paymentMethod === "ONLINE"
                  ? "Continue to Payment"
                  : "Place Order"}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;