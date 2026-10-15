import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import api from "../services/api";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setResendAvailable(false);
    setResendMessage("");

    const { name, email, password, phone, address } = formData;

    if (!name || !email || !password || !phone) {
      setError(
        "Please provide your name, email, password and phone number."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
      });

      setSuccess(
        response.data.message ||
          "Account created. Check your email for the verification link."
      );
    } catch (error) {
      console.error("Registration failed:", error);

      const message =
        error.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
      setResendAvailable(error.response?.status === 503);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResendMessage("");
    try {
      const response = await api.post("/auth/resend-verification", { email: formData.email.trim() });
      setResendMessage(response.data.message);
    } catch (error) {
      setResendMessage(error.response?.data?.message || "Unable to resend the verification email.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <span className="auth-eyebrow">JOIN PIZZAGO</span>

          <h1>Create your account</h1>

          <p>
            Create an account and start ordering your favorite
            pizzas.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success" role="status">
              {success}
            </div>
          )}
          {resendAvailable && <button type="button" className="auth-text-button" onClick={resendVerification}>Resend verification email</button>}
          {resendMessage && <div className="auth-success" role="status">{resendMessage}</div>}

          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <div className="input-wrapper">
              <User size={18} />

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number</label>

            <div className="input-wrapper">
              <Phone size={18} />

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Delivery address
              <span className="optional-label">Optional</span>
            </label>

            <div className="input-wrapper input-wrapper-textarea">
              <MapPin size={18} />

              <textarea
                id="address"
                name="address"
                placeholder="Enter your delivery address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                autoComplete="street-address"
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>

          <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}

export default Register;
