import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim() || (!forgotPassword && !formData.password)) {
      setError(forgotPassword ? "Please enter your email address." : "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      if (forgotPassword) {
        const response = await api.post("/auth/forgot-password", { email: formData.email.trim() });
        setSuccess(response.data.message);
        return;
      }

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Login response is missing the token or user.");
      }

      // Store the authenticated session.
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on the role returned by the backend.
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Login to PizzaGo</h1>
          <p>Sign in to continue ordering your favorite pizzas.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          {success && <div className="auth-success" role="status">{success}</div>}

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
                required
              />
            </div>
          </div>

          {!forgotPassword && <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>}

          {!forgotPassword && <button type="button" className="auth-text-button" onClick={() => { setForgotPassword(true); setError(""); setSuccess(""); }}>Forgot password?</button>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (forgotPassword ? "Sending link..." : "Signing in...") : (forgotPassword ? "Send reset link" : "Login")}
          </button>
          {forgotPassword && <button type="button" className="auth-text-button" onClick={() => { setForgotPassword(false); setError(""); setSuccess(""); }}>Back to login</button>}
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
