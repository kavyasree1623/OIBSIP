import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  let user;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
