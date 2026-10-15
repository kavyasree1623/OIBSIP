import { useEffect, useState } from "react";

import "./Menu.css";

import PizzaCard from "../components/PizzaCard";
import { getPizzas } from "../services/pizzaService";
import { Link } from "react-router-dom";

function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPizzas = async () => {
      try {
        const data = await getPizzas();

        setPizzas(data.pizzas || []);
      } catch (error) {
        console.error("Failed to load menu:", error);
        setError("Unable to load the menu right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPizzas();
  }, []);

  const filteredPizzas =
    activeCategory === "All"
      ? pizzas
      : pizzas.filter(
          (pizza) => pizza.category === activeCategory
        );

  return (
    <main className="menu-page">
      <div className="container">
        <header className="menu-header">
          <span>OUR MENU</span>

          <h1>Choose your perfect pizza</h1>

          <p>
            Freshly prepared pizzas with delicious ingredients,
            customizable just the way you like them.
          </p>
          <Link className="menu-filter active menu-customize-link" to="/custom-pizza">
            Build your own pizza
          </Link>
        </header>

        <div className="menu-filters">
          <button
            className={
              activeCategory === "All"
                ? "menu-filter active"
                : "menu-filter"
            }
            onClick={() => setActiveCategory("All")}
          >
            All Pizzas
          </button>

          <button
            className={
              activeCategory === "Veg"
                ? "menu-filter active"
                : "menu-filter"
            }
            onClick={() => setActiveCategory("Veg")}
          >
            🟢 Veg
          </button>

          <button
            className={
              activeCategory === "Non-Veg"
                ? "menu-filter active"
                : "menu-filter"
            }
            onClick={() => setActiveCategory("Non-Veg")}
          >
            🔴 Non-Veg
          </button>
        </div>

        {loading && (
          <div className="menu-status">
            <p>Loading our pizzas...</p>
          </div>
        )}

        {error && (
          <div className="menu-status menu-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredPizzas.length === 0 && (
          <div className="menu-status">
            <p>No pizzas found.</p>
          </div>
        )}

        {!loading && !error && filteredPizzas.length > 0 && (
          <div className="menu-grid" id="pizza-grid">
            {filteredPizzas.map((pizza) => (
              <PizzaCard
                key={pizza._id}
                pizza={pizza}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Menu;
