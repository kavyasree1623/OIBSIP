import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import "./PizzaDetails.css";

import { getPizzaById } from "../services/pizzaService";
import { useCart } from "../context/CartContext";

function PizzaDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [size, setSize] = useState("medium");
  const [crust, setCrust] = useState("");
  const [sauce, setSauce] = useState("");
  const [toppings, setToppings] = useState([]);
  const [extraCheese, setExtraCheese] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadPizza = async () => {
      try {
        const data = await getPizzaById(id);
        const loadedPizza = data.pizza;

        setPizza(loadedPizza);

        // Set the first available database option as default
        setCrust(
          loadedPizza.crusts?.[0]?.name || ""
        );

        setSauce(
          loadedPizza.sauces?.[0]?.name || ""
        );
      } catch (error) {
        console.error("Failed to load pizza:", error);
        setError("Unable to load this pizza.");
      } finally {
        setLoading(false);
      }
    };

    loadPizza();
  }, [id]);

  const toggleTopping = (topping) => {
    setToppings((current) => {
      const exists = current.some(
        (item) => item.name === topping.name
      );

      if (exists) {
        return current.filter(
          (item) => item.name !== topping.name
        );
      }

      return [...current, topping];
    });
  };

  const basePrice = pizza?.sizes?.[size] || 0;

  const selectedCrust =
    pizza?.crusts?.find(
      (item) => item.name === crust
    ) || null;

  const selectedSauce =
    pizza?.sauces?.find(
      (item) => item.name === sauce
    ) || null;

  const crustPrice = selectedCrust?.price || 0;

  const saucePrice = selectedSauce?.price || 0;

  const toppingsPrice = toppings.reduce(
    (total, item) => total + item.price,
    0
  );

  const extraCheeseOption =
    pizza?.cheeseOptions?.find(
      (item) => item.name === "Extra Cheese"
    ) || null;

  const cheesePrice = extraCheese
    ? extraCheeseOption?.price || 0
    : 0;

  const singlePizzaPrice =
    basePrice +
    crustPrice +
    saucePrice +
    toppingsPrice +
    cheesePrice;

  const totalPrice = singlePizzaPrice * quantity;

  if (loading) {
    return (
      <main className="pizza-details-page">
        <div className="container pizza-details-status">
          Loading pizza...
        </div>
      </main>
    );
  }

  if (error || !pizza) {
    return (
      <main className="pizza-details-page">
        <div className="container pizza-details-status pizza-details-error">
          {error || "Pizza not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="pizza-details-page">
      <div className="container">
        <Link to="/menu" className="back-to-menu">
          <ArrowLeft size={17} />
          Back to menu
        </Link>

        <div className="pizza-details-layout">
          <div className="pizza-details-image">
            <img
              src={pizza.image}
              alt={pizza.name}
            />
          </div>

          <div className="pizza-details-content">
            <span className="pizza-details-category">
              {pizza.category}
            </span>

            <h1>{pizza.name}</h1>

            <p className="pizza-details-description">
              {pizza.description}
            </p>

            {/* SIZE */}
            <section className="customization-section">
              <div className="customization-heading">
                <h2>Choose your size</h2>
                <span>Required</span>
              </div>

              <div className="option-grid">
                {Object.entries(pizza.sizes).map(
                  ([sizeName, price]) => (
                    <button
                      key={sizeName}
                      type="button"
                      className={`option-card ${
                        size === sizeName
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSize(sizeName)
                      }
                    >
                      <span>
                        {sizeName.charAt(0).toUpperCase() +
                          sizeName.slice(1)}
                      </span>

                      <strong>₹{price}</strong>
                    </button>
                  )
                )}
              </div>
            </section>

            {/* CRUST */}
            <section className="customization-section">
              <div className="customization-heading">
                <h2>Choose your crust</h2>
                <span>Required</span>
              </div>

              <div className="option-list">
                {pizza.crusts?.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`list-option ${
                      crust === option.name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCrust(option.name)
                    }
                  >
                    <span>{option.name}</span>

                    <strong>
                      {option.price === 0
                        ? "Included"
                        : `+₹${option.price}`}
                    </strong>
                  </button>
                ))}
              </div>
            </section>

            {/* SAUCE */}
            <section className="customization-section">
              <div className="customization-heading">
                <h2>Choose your sauce</h2>
                <span>Required</span>
              </div>

              <div className="option-list">
                {pizza.sauces?.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`list-option ${
                      sauce === option.name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSauce(option.name)
                    }
                  >
                    <span>{option.name}</span>

                    <strong>
                      {option.price === 0
                        ? "Included"
                        : `+₹${option.price}`}
                    </strong>
                  </button>
                ))}
              </div>
            </section>

            {/* TOPPINGS */}
            <section className="customization-section">
              <div className="customization-heading">
                <h2>Add toppings</h2>
                <span>Optional</span>
              </div>

              <div className="option-list">
                {[
                  ...(pizza.vegToppings || []),
                  ...(pizza.nonVegToppings || []),
                ].map((option) => {
                  const selected = toppings.some(
                    (item) =>
                      item.name === option.name
                  );

                  return (
                    <button
                      key={option.name}
                      type="button"
                      className={`list-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        toggleTopping(option)
                      }
                    >
                      <span>
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                        />

                        {option.name}
                      </span>

                      <strong>
                        +₹{option.price}
                      </strong>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CHEESE */}
            <section className="customization-section">
              <div className="customization-heading">
                <h2>Choose your cheese</h2>
                <span>Regular included</span>
              </div>

              <div className="option-list">
                {pizza.cheeseOptions?.map((option) => {
                  if (![
                    "Regular Cheese",
                    "Extra Cheese",
                  ].includes(option.name)) return null;

                  const selected = option.name === "Regular Cheese"
                    ? !extraCheese
                    : extraCheese;

                  return (
                    <button
                      key={option.name}
                      type="button"
                      className={`list-option ${selected ? "selected" : ""}`}
                      onClick={() => setExtraCheese(option.name === "Extra Cheese")}
                    >
                      <span>
                        <input type="radio" name="cheese" checked={selected} readOnly />
                        {option.name}
                      </span>
                      <strong>{option.price === 0 ? "Included" : `+₹${option.price}`}</strong>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* FOOTER */}
            <div className="pizza-details-footer">
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  <Minus size={16} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) => current + 1
                    )
                  }
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="pizza-total">
                <span>Total</span>
                <strong>₹{totalPrice}</strong>
              </div>

              <button
                type="button"
                className="add-customized-pizza"
                onClick={() => {
                  addToCart(pizza, size, {
                    crust,
                    sauce,
                    toppings,
                    extraCheese,
                    quantity,
                    price: singlePizzaPrice,
                  });
                }}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PizzaDetails;
