import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  User,
  LogOut,
  ShoppingBag,
} from "lucide-react";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (!user) {
    return (
      <main className="profile-page">
        <div className="container">
          <div className="profile-login-message">
            <User size={40} />

            <h1>You're not logged in</h1>

            <p>
              Please login to view your profile and manage
              your account.
            </p>

            <Link to="/login" className="profile-primary-button">
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-header">
          <span>MY ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your PizzaGo account details.</p>
        </div>

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-avatar">
              <User size={32} />
            </div>

            <div className="profile-main-info">
              <h2>{user.name}</h2>
              <span className="profile-role">
                {user.role || "Customer"}
              </span>
            </div>

            <div className="profile-details">
              <div className="profile-detail">
                <Mail size={19} />

                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <Phone size={19} />

                <div>
                  <span>Phone</span>
                  <strong>
                    {user.phone || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="profile-detail">
                <MapPin size={19} />

                <div>
                  <span>Delivery Address</span>
                  <strong>
                    {user.address || "No address added"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <aside className="profile-actions-card">
            <h2>Quick Actions</h2>

            <Link
              to="/orders"
              className="profile-action"
            >
              <ShoppingBag size={19} />

              <div>
                <strong>My Orders</strong>
                <span>View your order history</span>
              </div>
            </Link>

            <button
              type="button"
              className="profile-action profile-logout"
              onClick={handleLogout}
            >
              <LogOut size={19} />

              <div>
                <strong>Logout</strong>
                <span>Sign out of your account</span>
              </div>
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Profile;