import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "../context/CartContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <h1>Your cart is empty</h1>
            <p>Add a delicious pizza to get started.</p>

            <Link to="/menu" className="btn-primary">
              Explore Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="cart-header">
          <span>YOUR ORDER</span>
          <h1>Your Cart</h1>
        </div>

        <div className="cart-layout">
          <section className="cart-items">
            {cartItems.map((item) => (
              <article
                className="cart-item"
                key={item.customizationKey}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h2>{item.name}</h2>

                  <p>
                    Size:{" "}
                    <strong>
                      {item.size.charAt(0).toUpperCase() +
                        item.size.slice(1)}
                    </strong>
                  </p>

                  <div className="cart-customizations">
                    <p>
                      Crust: <strong>{item.crust}</strong>
                    </p>

                    <p>
                      Sauce: <strong>{item.sauce}</strong>
                    </p>

                    {item.toppings?.length > 0 && (
                      <p>
                        Toppings:{" "}
                        <strong>
                          {item.toppings
                            .map((topping) => topping.name)
                            .join(", ")}
                        </strong>
                      </p>
                    )}

                    {item.extraCheese && (
                      <p>
                        <strong>Extra cheese</strong>
                      </p>
                    )}
                  </div>

                  <strong>₹{item.price} / pizza</strong>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.customizationKey)
                      }
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.customizationKey)
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(item.customizationKey)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="cart-item-total">
                  ₹{item.price * item.quantity}
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>Free</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <Link to="/checkout" className="checkout-button">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;