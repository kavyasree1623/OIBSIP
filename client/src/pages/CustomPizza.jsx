import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Menu.css";
import PizzaCard from "../components/PizzaCard";
import { getPizzas } from "../services/pizzaService";

function CustomPizza() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPizzas()
      .then((data) => {
        if (active) setPizzas(data.pizzas || []);
      })
      .catch((loadError) => {
        console.error("Failed to load pizza bases:", loadError);
        if (active) setError("Unable to load pizzas for customization.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="menu-page">
      <div className="container">
        <header className="menu-header">
          <span>MAKE IT YOURS</span>
          <h1>Build your own pizza</h1>
          <p>Choose a real available pizza as your starting point, then select its size, crust, sauce, toppings, and cheese.</p>
          <Link className="menu-filter" to="/menu">Back to menu</Link>
        </header>

        {loading && <div className="menu-status"><p>Loading available pizzas...</p></div>}
        {error && <div className="menu-status menu-error"><p>{error}</p></div>}
        {!loading && !error && pizzas.length === 0 && (
          <div className="menu-status"><p>No available pizzas to customize.</p></div>
        )}
        {!loading && !error && pizzas.length > 0 && (
          <div className="menu-grid">
            {pizzas.map((pizza) => <PizzaCard key={pizza._id} pizza={pizza} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomPizza;
