
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Menu from "./pages/Menu";
import CustomPizza from "./pages/CustomPizza";
import PizzaDetails from "./pages/PizzaDetails";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import { ResetPassword, VerifyEmail } from "./pages/EmailAction";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/custom-pizza" element={<CustomPizza />} />
        <Route path="/pizza/:id" element={<PizzaDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="/orders/:id" element={<OrderDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
