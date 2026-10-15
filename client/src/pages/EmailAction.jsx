import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export function VerifyEmail() {
  const { token } = useParams();
  const verificationStarted = useRef(false);
  const [message, setMessage] = useState("Verifying your email…");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;
    api.get(`/auth/verify-email/${token}`)
      .then((response) => setMessage(response.data.message))
      .catch((requestError) => {
        setError(true);
        setMessage(requestError.response?.data?.message || "Unable to verify this email.");
      });
  }, [token]);

  return <main className="auth-page"><div className="auth-card"><div className="auth-header"><h1>Email verification</h1><p className={error ? "auth-error" : "auth-success"} role="status">{message}</p><Link to="/login">Continue to login</Link></div></div></main>;
}

export function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(true);
      setMessage(requestError.response?.data?.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-page"><div className="auth-card"><div className="auth-header"><h1>Choose a new password</h1></div><form className="auth-form" onSubmit={submit}>{message && <div className={error ? "auth-error" : "auth-success"} role="status">{message}</div>}<div className="form-group"><label htmlFor="new-password">New password</label><input id="new-password" type="password" minLength="6" autoComplete="new-password" required value={password} onChange={(event) => { setPassword(event.target.value); setError(false); }} /></div><button className="auth-submit" type="submit" disabled={loading}>{loading ? "Saving…" : "Reset password"}</button></form><div className="auth-footer"><Link to="/login">Back to login</Link></div></div></main>;
}
