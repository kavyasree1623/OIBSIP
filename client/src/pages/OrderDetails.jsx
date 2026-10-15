import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";

import api from "../services/api";

import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadOrder = async (initial = false) => {
      try {
        if (initial) {
          setLoading(true);
          setError("");
        }

        const response = await api.get(`/orders/${id}`);

        if (active) setOrder(response.data.order);
      } catch (error) {
        console.error("Failed to load order:", error);
        if (active && initial) {
          setError(error.response?.data?.message || "Unable to load this order.");
        }
      } finally {
        if (active && initial) setLoading(false);
      }
    };

    loadOrder(true);
    const poll = window.setInterval(() => loadOrder(), 5000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, [id]);

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="container">
          <div className="order-details-state">
            <div className="order-loading-spinner" />
            <p>Loading your order...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="container">
          <div className="order-details-state">
            <ShoppingBag size={42} />

            <h1>Order not found</h1>

            <p>{error || "We couldn't find this order."}</p>

            <Link
              to="/orders"
              className="order-primary-button"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(
    order.createdAt
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="order-details-page">
      <div className="container">
        <Link
          to="/orders"
          className="order-back-link"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>

        <div className="order-details-header">
          <div>
            <span>ORDER DETAILS</span>

            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>

            <p>
              Placed on {formattedDate}
            </p>
          </div>

          <div className="order-status-badge">
            <CheckCircle size={17} />
            {order.orderStatus}
          </div>
        </div>

        <div className="order-details-layout">
          <section className="order-main-content">
            <div className="order-card">
              <div className="order-card-header">
                <div>
                  <h2>Your Items</h2>

                  <p>
                    {order.items.length}{" "}
                    {order.items.length === 1
                      ? "item"
                      : "items"}{" "}
                    in this order
                  </p>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <article
                    className="order-item"
                    key={`${item.pizza?._id || item.pizza}-${index}`}
                  >
                    <div className="order-item-image-wrapper">
                      <img
                        src={
                          item.pizza?.image ||
                          "https://images.unsplash.com/photo-1579751626657-72bc17010498"
                        }
                        alt={item.name}
                        className="order-item-image"
                      />

                      <span className="order-item-quantity">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="order-item-details">
                      <h3>{item.name}</h3>

                      <p>
                        Size:{" "}
                        <strong>
                          {item.size
                            .charAt(0)
                            .toUpperCase() +
                            item.size.slice(1)}
                        </strong>
                      </p>

                      <p>
                        Crust:{" "}
                        <strong>
                          {item.crust?.name}
                        </strong>
                      </p>

                      <p>
                        Sauce:{" "}
                        <strong>
                          {item.sauce?.name}
                        </strong>
                      </p>

                      {item.toppings?.length > 0 && (
                        <p>
                          Toppings:{" "}
                          <strong>
                            {item.toppings
                              .map(
                                (topping) =>
                                  topping.name
                              )
                              .join(", ")}
                          </strong>
                        </p>
                      )}

                      {item.extraCheese && (
                        <p>
                          <strong>
                            Extra Cheese
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="order-item-price">
                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>

                      <span>
                        ₹{item.price} / pizza
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="order-card">
              <div className="order-card-header">
                <div>
                  <h2>Delivery Details</h2>

                  <p>
                    Your order will be delivered here.
                  </p>
                </div>
              </div>

              <div className="order-delivery-details">
                <div className="order-detail-row">
                  <div className="order-detail-icon">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <span>Delivery Address</span>
                    <strong>
                      {order.deliveryAddress}
                    </strong>
                  </div>
                </div>

                <div className="order-detail-row">
                  <div className="order-detail-icon">
                    <Phone size={19} />
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {order.phone}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="order-sidebar">
            <div className="order-card order-summary-card">
              <h2>Order Summary</h2>

              <div className="order-summary-row">
                <span>Subtotal</span>
                <strong>
                  ₹{order.totalAmount}
                </strong>
              </div>

              <div className="order-summary-row">
                <span>Delivery</span>
                <strong>Free</strong>
              </div>

              <div className="order-summary-divider" />

              <div className="order-summary-total">
                <span>Total</span>
                <strong>
                  ₹{order.totalAmount}
                </strong>
              </div>
            </div>

            <div className="order-card order-payment-card">
              <h2>Payment</h2>

              <div className="order-payment-row">
                <span>Method</span>

                <strong>
                  {order.paymentMethod ===
                  "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </div>

              <div className="order-payment-row">
                <span>Status</span>

                <strong
                  className={`payment-status payment-status-${order.paymentStatus.toLowerCase()}`}
                >
                  {order.paymentStatus}
                </strong>
              </div>
            </div>

            <div className="order-card order-tracking-card">
              <div className="order-tracking-icon">
                <Clock size={22} />
              </div>

              <div>
                <h2>Order Status</h2>

                <strong>
                  {order.orderStatus}
                </strong>

                <p>
                  We'll keep your order status updated
                  as it moves through the kitchen and
                  delivery process.
                </p>
              </div>
            </div>

            <Link
              to="/menu"
              className="order-primary-button order-menu-button"
            >
              Order More Pizza
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;
