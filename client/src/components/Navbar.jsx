import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";

import { useCart } from "../context/CartContext";

import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const isLoggedIn = Boolean(token && user);
  const isAdmin = isLoggedIn && user.role === "admin" &&
    !["/login", "/register"].includes(pathname);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🍕</span>
          <span>PizzaGo</span>
        </Link>

        
{!isAdmin && (
  <nav className="navbar-links">
    <Link to="/">Home</Link>
    <Link to="/menu">Menu</Link>
    <Link to="/orders">My Orders</Link>
  </nav>
)}
{isAdmin && (
  <nav className="navbar-links">
    <Link to="/">Home</Link>
    <Link to="/menu">Menu</Link>
    <Link to="/orders">My Orders</Link>
    <Link to="/admin">Admin</Link>
  </nav>
)}


{!isAdmin && (
  <div className="navbar-actions">
    {isLoggedIn ? (
      <Link to="/profile" className="navbar-icon" title="Profile">
        <User size={21} />
      </Link>
    ) : (
      <Link to="/login" className="navbar-login">
        Login
      </Link>
    )}

    <Link to="/cart" className="navbar-icon" title="Cart">
      <ShoppingCart size={21} />
      <span className="cart-count">{cartCount}</span>
    </Link>
  </div>
)}
      </div>
    </header>
  );
}

export default Navbar;
