import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import "./PizzaCard.css";

function PizzaCard({ pizza }) {
  return (
    <article className="pizza-card">
      <Link
        to={`/pizza/${pizza._id}`}
        className="pizza-card-image-link"
      >
        <div className="pizza-card-image">
          <img src={pizza.image} alt={pizza.name} />
        </div>
      </Link>

      <div className="pizza-card-content">
        <div className="pizza-card-category">
          {pizza.category}
        </div>

        <h3>{pizza.name}</h3>

        <p>{pizza.description}</p>

        <div className="pizza-card-bottom">
          <div>
            <span className="pizza-card-label">From</span>

            <strong>
              ₹{pizza.sizes.small}
            </strong>
          </div>

          <Link
            to={`/pizza/${pizza._id}`}
            className="pizza-card-button"
          >
            Customize
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PizzaCard;