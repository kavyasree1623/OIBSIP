import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import api from "../services/api";

import "./Orders.css";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders");

        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Failed to load orders:", error);

        const message =
          error.response?.data?.message ||
          "Unable to load your orders.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="container">
          <div className="orders-state">
            <div className="orders-loading-spinner" />
            <p>Loading your orders...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="container">
          <div className="orders-state">
            <ShoppingBag size={42} />

            <h1>Unable to load orders</h1>

            <p>{error}</p>

            <Link
              to="/menu"
              className="orders-primary-button"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <div className="container">
          <div className="orders-header">
            <span>YOUR ORDERS</span>
            <h1>My Orders</h1>
            <p>
              Keep track of your PizzaGo orders in one place.
            </p>
          </div>

          <div className="orders-state orders-empty">
            <ShoppingBag size={42} />

            <h2>No orders yet</h2>

            <p>
              You haven't placed an order yet. Let's fix that.
            </p>

            <Link
              to="/menu"
              className="orders-primary-button"
            >
              Order Your First Pizza
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="container">
        <div className="orders-header">
          <span>YOUR ORDERS</span>

          <h1>My Orders</h1>

          <p>
            Keep track of your PizzaGo orders in one place.
          </p>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(
              order.createdAt
            ).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <article
                className="order-history-card"
                key={order._id}
              >
                <div className="order-history-main">
                  <div className="order-history-icon">
                    <ShoppingBag size={21} />
                  </div>

                  <div className="order-history-info">
                    <div className="order-history-title">
                      <h2>
                        Order #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </h2>

                      <span
                        className={`order-status order-status-${order.orderStatus
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <p className="order-history-date">
                      {formattedDate}
                    </p>

                    <p className="order-history-items">
                      {order.items
                        .map(
                          (item) =>
                            `${item.name} × ${item.quantity}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                </div>

                <div className="order-history-right">
                  <div className="order-history-total">
                    <span>Total</span>
                    <strong>
                      ₹{order.totalAmount}
                    </strong>
                  </div>

                  <div className="order-history-payment">
                    <span>
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>

                    <span
                      className={`payment-status payment-status-${order.paymentStatus.toLowerCase()}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="order-view-button"
                  >
                    View Order
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Orders;
