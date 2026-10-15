import { useEffect, useMemo, useState } from "react";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import "./Admin.css";
import api from "../services/api";
import adminPizzaService from "../services/adminPizzaService";

const navItems = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "pizzas", label: "Pizza management", icon: "◉" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "customers", label: "Customers", icon: "♙" },
  { id: "inventory", label: "Inventory", icon: "▦" },
  { id: "settings", label: "Profile & settings", icon: "⚙" },
];

const statuses = [
  "Placed", "Confirmed", "Preparing",
  "Out for Delivery", "Delivered", "Cancelled",
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const blankPizzaForm = () => ({
  name: "",
  description: "",
  category: "Veg",
  image: "",
  available: true,
  sizes: { small: "", medium: "", large: "" },
  crusts: [{ name: "", price: "0" }],
  sauces: [{ name: "", price: "0" }],
  vegToppings: [],
  nonVegToppings: [],
  cheeseOptions: [],
});

function StatusBadge({ status }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`admin-status admin-status-${cls}`}>{status}</span>;
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="admin-section-title">
      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OptionEditor({ title, field, options, onUpdate, onAdd, onRemove }) {
  return (
    <section className="admin-form-section">
      <div className="admin-option-heading">
        <h3>{title}</h3>
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => onAdd(field)}
        >
          + Add option
        </button>
      </div>

      {options.map((option, index) => (
        <div className="admin-option-row" key={`${field}-${index}`}>
          <input
            value={option.name}
            placeholder="Option name"
            onChange={(event) =>
              onUpdate(field, index, "name", event.target.value)
            }
          />
          <input
            type="number"
            min="0"
            step="1"
            value={option.price}
            placeholder="Extra price (₹)"
            onChange={(event) =>
              onUpdate(field, index, "price", event.target.value)
            }
          />
          <button
            type="button"
            className="admin-remove-btn"
            onClick={() => onRemove(field, index)}
          >
            Remove
          </button>
        </div>
      ))}

      {options.length === 0 && (
        <p className="admin-muted">No options added yet.</p>
      )}
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="admin-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Overview({ pizzas, orders, customers, paidTotal, navigate, setSelectedOrder, setModal }) {
  const preparing = orders.filter((order) =>
    ["Placed", "Confirmed", "Preparing", "Out for Delivery"].includes(order.status)
  ).length;

  const now = new Date();
  const periods = Array.from({ length: 12 }, (_, index) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (11 - index) * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end, label: start.toLocaleDateString(undefined, { weekday: "short" })[0] };
  });
  const bars = periods.map(({ start, end }) => orders.filter((order) => {
    const createdAt = order.raw?.createdAt && new Date(order.raw.createdAt);
    return createdAt && createdAt >= start && createdAt < end;
  }).length);
  const maxOrders = Math.max(...bars, 1);

  return (
    <>
      <div className="admin-welcome">
        <div>
          <span className="admin-eyebrow">YOUR BUSINESS AT A GLANCE</span>
          <h2>Good food. Great business.</h2>
          <p>Live activity from your store.</p>
          <button className="admin-welcome-button" onClick={() => navigate("orders")}>
            View orders <span>↗</span>
          </button>
        </div>
        <div className="admin-welcome-emoji">🍕</div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top"><span>Total menu items</span><span className="admin-stat-icon">◉</span></div>
          <strong className="admin-stat-value">{pizzas.length}</strong>
          <p>{pizzas.filter((pizza) => pizza.available).length} currently available</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top"><span>Total orders</span><span className="admin-stat-icon">▤</span></div>
          <strong className="admin-stat-value">{orders.length}</strong>
          <p>{preparing} active orders</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top"><span>Customers</span><span className="admin-stat-icon">♙</span></div>
          <strong className="admin-stat-value">{customers.length}</strong>
          <p>Registered customer accounts</p>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top"><span>Paid order value</span><span className="admin-stat-icon">₹</span></div>
          <strong className="admin-stat-value">{currency(paidTotal)}</strong>
          <p>Paid orders, excluding cancelled</p>
        </div>
      </div>

      <div className="admin-overview-grid">
        <div className="admin-panel admin-chart-panel">
          <div className="admin-panel-heading">
            <div><h3>Order activity</h3><p>Real orders · last 12 weeks</p></div>
            <span className="admin-chart-chip">{bars.reduce((sum, count) => sum + count, 0)} orders</span>
          </div>
          <div className="admin-chart">
            <div className="admin-chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div className="admin-chart-bars">
              {bars.map((count, index) => (
                <div className="admin-chart-bar-wrap" key={index}>
                  <div className={`admin-chart-bar ${index === 11 ? "highlight" : ""}`} style={{ height: `${(count / maxOrders) * 100}%` }} title={`${count} orders`} />
                  <small>{periods[index].label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel admin-popular-panel">
          <div className="admin-panel-heading">
            <div><h3>Menu snapshot</h3><p>Availability overview</p></div>
            <button className="admin-text-button" onClick={() => navigate("pizzas")}>Manage ↗</button>
          </div>
          {pizzas.slice(0, 4).map((pizza) => (
            <div className="admin-popular-row" key={pizza.id}>
              <span className="admin-product-emoji">{pizza.emoji || "🍕"}</span>
              <div><strong>{pizza.name}</strong><small>{pizza.category}</small></div>
              <div className="admin-popular-right">
                <strong>{currency(pizza.sizes?.small ?? pizza.price)}</strong>
                <small className={pizza.available ? "admin-text-green" : "admin-text-muted"}>
                  {pizza.available ? "Available" : "Unavailable"}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel admin-recent-panel">
        <div className="admin-panel-heading">
          <div><h3>Recent orders</h3><p>Latest activity from your store.</p></div>
          <button className="admin-secondary-button" onClick={() => navigate("orders")}>View all orders →</button>
        </div>
        <div className="admin-table-wrap embedded">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>
              {orders.slice(0, 4).map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong><small className="admin-cell-sub">{order.date}</small></td>
                  <td>{order.customer}</td>
                  <td className="admin-price">{currency(order.amount)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><button className="admin-text-button" onClick={() => { setSelectedOrder(order); setModal("order"); }}>View ↗</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-order-mobile">
          {orders.slice(0, 3).map((order) => (
            <button key={order.id} onClick={() => { setSelectedOrder(order); setModal("order"); }}>
              <strong>{order.id}</strong><span>{order.customer}</span><StatusBadge status={order.status} />
            </button>
          ))}
        </div>
      </div>

      <div className="admin-quick-actions">
        <button onClick={() => navigate("pizzas")}><span>🍕</span><strong>Add or manage pizzas</strong><small>Update your menu</small><b>↗</b></button>
        <button onClick={() => navigate("orders")}><span>📦</span><strong>Process orders</strong><small>Track fulfilment</small><b>↗</b></button>
        <button onClick={() => navigate("customers")}><span>👥</span><strong>Explore customers</strong><small>View customer profiles</small><b>↗</b></button>
      </div>
    </>
  );
}

export default function Admin() {
  const routerNavigate = useRouterNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [pizzas, setPizzas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryForm, setInventoryForm] = useState({ category: "base", name: "", quantity: "", lowStockThreshold: "5" });
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [orderFilter, setOrderFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingPizza, setEditingPizza] = useState(null);
  const [pizzaForm, setPizzaForm] = useState(blankPizzaForm);
  const signedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState({
    name: signedInUser.name || "", email: signedInUser.email || "", phone: signedInUser.phone || "",
  });
  const [preferences, setPreferences] = useState({
    orderAlerts: true, lowStockAlerts: true, weeklySummary: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    routerNavigate("/login");
  };

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const [pizzaResponse, orderResponse, userResponse, inventoryResponse] = await Promise.all([
          adminPizzaService.getAll(),
          api.get("/orders"),
          api.get("/users"),
          api.get("/inventory"),
        ]);
        if (cancelled) return;

        const users = userResponse.data.users || [];
        const loadedOrders = (orderResponse.data.orders || []).map((order) => ({
          id: order._id,
          customerId: order.user?._id,
          customer: order.user?.name || "Customer",
          items: (order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(", "),
          amount: order.totalAmount,
          status: order.orderStatus,
          payment: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          inventoryDeducted: Boolean(order.inventoryDeducted),
          date: order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
          raw: order,
        }));

        setPizzas((pizzaResponse.pizzas || []).map((pizza) => ({
          ...pizza,
          id: pizza._id || pizza.id,
        })));
        setOrders(loadedOrders);
        setInventory(inventoryResponse.data.items || []);
        setCustomers(users.filter((user) => user.role === "customer").map((user) => {
          const userOrders = loadedOrders.filter((order) => order.customerId === user._id);
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            orders: userOrders.length,
            spent: userOrders.filter((order) => order.payment === "Paid")
              .reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
            joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
          };
        }));
      } catch (error) {
        if (!cancelled) setDataError(error.response?.data?.message || "Unable to load dashboard data. Check the backend and admin access.");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadDashboardData();
    return () => { cancelled = true; };
  }, []);

  const saveInventory = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/inventory", {
        ...inventoryForm,
        quantity: Number(inventoryForm.quantity),
        lowStockThreshold: Number(inventoryForm.lowStockThreshold),
      });
      setInventory((items) => [...items.filter((item) => item._id !== response.data.item._id), response.data.item]
        .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
      setInventoryForm((form) => ({ ...form, name: "", quantity: "" }));
      notify("Inventory updated.");
    } catch (error) {
      notify(error.response?.data?.message || "Unable to update inventory.");
    }
  };

  const filteredPizzas = useMemo(() => pizzas.filter((pizza) => {
    const matchesSearch = pizza.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "All" || pizza.category === category);
  }), [pizzas, search, category]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (orderFilter === "All" || order.status === orderFilter);
  }), [orders, search, orderFilter]);

  const filteredCustomers = useMemo(() => customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(search.toLowerCase())
  ), [customers, search]);

  const paidTotal = orders
    .filter((order) => order.payment === "Paid" && order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.amount, 0);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const navigate = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setModal(null);
    setSelectedOrder(null);
    setSelectedCustomer(null);
  };

  const optionArrayOrBlank = (options) =>
    Array.isArray(options) && options.length
      ? options.map((option) => ({
          name: option.name || "",
          price: String(option.price ?? "0"),
        }))
      : [];

  const openPizzaForm = (pizza = null) => {
    setEditingPizza(pizza);

    if (!pizza) {
      setPizzaForm(blankPizzaForm());
    } else {
      setPizzaForm({
        name: pizza.name || "",
        description: pizza.description || "",
        category: pizza.category || "Veg",
        image: pizza.image || "",
        available: pizza.available ?? true,
        sizes: {
          small: String(pizza.sizes?.small ?? pizza.price ?? ""),
          medium: String(pizza.sizes?.medium ?? ""),
          large: String(pizza.sizes?.large ?? ""),
        },
        crusts: optionArrayOrBlank(pizza.crusts),
        sauces: optionArrayOrBlank(pizza.sauces),
        vegToppings: optionArrayOrBlank(pizza.vegToppings),
        nonVegToppings: optionArrayOrBlank(pizza.nonVegToppings),
        cheeseOptions: optionArrayOrBlank(pizza.cheeseOptions),
      });
    }

    setModal("pizza");
  };

  const updatePizzaOption = (field, index, key, value) => {
    setPizzaForm((previous) => ({
      ...previous,
      [field]: previous[field].map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option
      ),
    }));
  };

  const addPizzaOption = (field) => {
    setPizzaForm((previous) => ({
      ...previous,
      [field]: [...previous[field], { name: "", price: "0" }],
    }));
  };

  const removePizzaOption = (field, index) => {
    setPizzaForm((previous) => ({
      ...previous,
      [field]: previous[field].filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const savePizza = async (event) => {
    event.preventDefault();

    if (!pizzaForm.name.trim()) {
      notify("Enter a pizza name.");
      return;
    }

    const sizes = {
      small: Number(pizzaForm.sizes.small),
      medium: Number(pizzaForm.sizes.medium),
      large: Number(pizzaForm.sizes.large),
    };

    if (Object.values(sizes).some((price) => !Number.isFinite(price) || price <= 0)) {
      notify("Enter a valid price greater than ₹0 for all three sizes.");
      return;
    }

    const optionFields = ["crusts", "sauces", "vegToppings", "nonVegToppings", "cheeseOptions"];
    const invalidOption = optionFields.some((field) =>
      pizzaForm[field].some((option) =>
        option.name.trim() &&
        (!Number.isFinite(Number(option.price)) || Number(option.price) < 0)
      )
    );

    if (invalidOption) {
      notify("Option prices cannot be negative.");
      return;
    }

    const options = {};
    optionFields.forEach((field) => {
      options[field] = pizzaForm[field]
        .filter((option) => option.name.trim())
        .map((option) => ({
          name: option.name.trim(),
          price: Number(option.price || 0),
        }));
    });

    if (options.crusts.length < 5 || options.sauces.length < 5) {
      notify("Add at least five base options and five sauce options.");
      return;
    }

    if (!options.cheeseOptions.length) {
      notify("Add at least one cheese option.");
      return;
    }

    const pizzaData = {
      name: pizzaForm.name.trim(),
      description: pizzaForm.description.trim(),
      category: pizzaForm.category,
      image: pizzaForm.image.trim(),
      available: pizzaForm.available,
      sizes,
      price: sizes.small,
      ...options,
    };

    try {
      const response = editingPizza
        ? await adminPizzaService.update(editingPizza.id, pizzaData)
        : await adminPizzaService.create(pizzaData);
      const savedPizza = { ...response.pizza, id: response.pizza._id || response.pizza.id };
      setPizzas((old) => editingPizza
        ? old.map((pizza) => pizza.id === editingPizza.id ? savedPizza : pizza)
        : [savedPizza, ...old]);
      notify(editingPizza ? "Pizza updated." : "Pizza added.");
      setModal(null);
    } catch (error) {
      notify(error.response?.data?.message || "Unable to save pizza.");
    }
  };

  const toggleAvailability = async (id) => {
    const pizza = pizzas.find((item) => item.id === id);
    if (!pizza) return;
    try {
      const response = await adminPizzaService.update(id, { available: !pizza.available });
      const updated = { ...response.pizza, id: response.pizza._id || response.pizza.id };
      setPizzas((old) => old.map((item) => item.id === id ? updated : item));
    } catch (error) {
      notify(error.response?.data?.message || "Unable to update availability.");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { orderStatus: status });
      const updatedOrder = response.data.order;
      setOrders((old) => old.map((order) => order.id === id ? {
        ...order,
        status,
        inventoryDeducted: Boolean(updatedOrder.inventoryDeducted),
        raw: updatedOrder,
      } : order));
      setSelectedOrder((old) => old?.id === id ? {
        ...old,
        status,
        inventoryDeducted: Boolean(updatedOrder.inventoryDeducted),
        raw: updatedOrder,
      } : old);
      notify(response.data.message || `Order ${id} updated.`);
    } catch (error) {
      notify(error.response?.data?.message || "Unable to update order status.");
    }
  };

  const pageTitle = navItems.find((item) => item.id === activeTab)?.label;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("overview")}>
          <span className="admin-brand-icon">🍕</span>
          <span><strong>Pizza House</strong><small>ADMIN CONSOLE</small></span>
        </button>

        <div className="admin-menu-label">WORKSPACE</div>
        <nav className="admin-navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeTab === item.id && <span className="admin-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-status-dot" />
          <div><strong>Store connected</strong><p>{dataLoading ? "Loading live data…" : dataError ? "Data unavailable" : "Live store data"}</p></div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">Workspace <span>/</span> {pageTitle}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-preview-badge"><span /> Live dashboard</span>
            <button className="admin-avatar" onClick={() => navigate("settings")} title="Admin profile">A</button>
          </div>
        </header>

        <section className="admin-content">
          {dataLoading && <div className="admin-empty" role="status">Loading live store data…</div>}
          {!dataLoading && dataError && <div className="admin-empty" role="alert">{dataError}</div>}
          {activeTab === "overview" && !dataLoading && !dataError && (
            <Overview
              pizzas={pizzas}
              orders={orders}
              customers={customers}
              paidTotal={paidTotal}
              navigate={navigate}
              setSelectedOrder={setSelectedOrder}
              setModal={setModal}
            />
          )}

          {activeTab === "pizzas" && !dataLoading && !dataError && (
            <>
              <SectionTitle
                eyebrow="MENU & INVENTORY"
                title="Pizza management"
                description="Keep your menu fresh, accurate, and available."
                action={<button className="admin-primary-button" onClick={() => openPizzaForm()}>＋ Add pizza</button>}
              />

              <div className="admin-toolbar">
                <input className="admin-search" placeholder="⌕ Search pizzas..." value={search} onChange={(event) => setSearch(event.target.value)} />
                <select className="admin-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option>All</option><option>Veg</option><option>Non-Veg</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Pizza</th><th>Category</th><th>Size prices</th><th>Availability</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredPizzas.map((pizza) => (
                      <tr key={pizza.id}>
                        <td>
                          <div className="admin-product-cell">
                            {pizza.image ? (
                              <img
                                className="admin-pizza-thumbnail"
                                src={pizza.image}
                                alt={pizza.name}
                                onError={(event) => { event.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <span className="admin-product-emoji">{pizza.emoji || "🍕"}</span>
                            )}
                            <div className="admin-pizza-name">
                              <strong>{pizza.name}</strong>
                              {pizza.description && <small>{pizza.description}</small>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-category ${pizza.category === "Veg" ? "veg" : "nonveg"}`}>
                            <i />{pizza.category}
                          </span>
                        </td>
                        <td>
                          <div className="admin-size-prices">
                            <span>Small: {currency(pizza.sizes?.small ?? pizza.price)}</span>
                            <span>Medium: {currency(pizza.sizes?.medium ?? pizza.price)}</span>
                            <span>Large: {currency(pizza.sizes?.large ?? pizza.price)}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`admin-toggle ${pizza.available ? "on" : ""}`}
                            onClick={() => toggleAvailability(pizza.id)}
                            aria-label={`Toggle ${pizza.name} availability`}
                          ><span /></button>
                          <span className="admin-availability">{pizza.available ? "Available" : "Unavailable"}</span>
                        </td>
                        <td><button className="admin-text-button" onClick={() => openPizzaForm(pizza)}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPizzas.length === 0 && <div className="admin-empty">No pizzas match your search.</div>}
              </div>
              <p className="admin-table-footnote">Showing {filteredPizzas.length} of {pizzas.length} menu items.</p>
            </>
          )}

          {activeTab === "orders" && !dataLoading && !dataError && (
            <>
              <SectionTitle eyebrow="FULFILMENT" title="Order management" description="Review incoming orders and update their progress." />
              <div className="admin-mini-stats">
                <MiniStat label="All orders" value={orders.length} />
                <MiniStat label="Needs attention" value={orders.filter((order) => ["Placed", "Confirmed"].includes(order.status)).length} />
                <MiniStat label="Preparing" value={orders.filter((order) => order.status === "Preparing").length} />
                <MiniStat label="Delivered" value={orders.filter((order) => order.status === "Delivered").length} />
              </div>
              <div className="admin-toolbar">
                <input className="admin-search" placeholder="⌕ Search order or customer..." value={search} onChange={(event) => setSearch(event.target.value)} />
                <select className="admin-select" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}>
                  <option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Order total</th><th>Payment</th><th>Status</th><th>Details</th></tr></thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong><small className="admin-cell-sub">{order.date}</small></td>
                        <td>{order.customer}<small className="admin-cell-sub">{order.items}</small></td>
                        <td className="admin-price">{currency(order.amount)}</td>
                        <td><span className="admin-payment">{order.payment}</span></td>
                        <td><StatusBadge status={order.status} /></td>
                        <td><button className="admin-text-button" onClick={() => { setSelectedOrder(order); setModal("order"); }}>View order ↗</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && <div className="admin-empty">No orders match your search.</div>}
              </div>
            </>
          )}

          {activeTab === "customers" && !dataLoading && !dataError && (
            <>
              <SectionTitle eyebrow="CUSTOMER RELATIONSHIPS" title="Customers" description="Understand your customer base and their order history." />
              <div className="admin-mini-stats">
                <MiniStat label="Registered customers" value={customers.length} />
                <MiniStat label="Total customer orders" value={customers.reduce((sum, customer) => sum + customer.orders, 0)} />
                <MiniStat label="Repeat customers" value={customers.filter((customer) => customer.orders > 1).length} />
                <MiniStat label="Paid customer spend" value={currency(customers.reduce((sum, customer) => sum + customer.spent, 0))} />
              </div>
              <div className="admin-toolbar">
                <input className="admin-search" placeholder="⌕ Search name, email, or phone..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Paid spend</th><th>Joined</th><th>Details</th></tr></thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td><div className="admin-customer-cell"><span className="admin-customer-avatar">{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><strong>{customer.name}</strong></div></td>
                        <td>{customer.email}<small className="admin-cell-sub">{customer.phone}</small></td>
                        <td>{customer.orders}</td>
                        <td className="admin-price">{currency(customer.spent)}</td>
                        <td>{customer.joined}</td>
                        <td><button className="admin-text-button" onClick={() => { setSelectedCustomer(customer); setModal("customer"); }}>View profile ↗</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && <div className="admin-empty">No customers match your search.</div>}
              </div>
            </>
          )}

          {activeTab === "inventory" && !dataLoading && !dataError && (
            <>
              <SectionTitle eyebrow="STOCK CONTROL" title="Inventory" description="Set current quantities and low-stock thresholds for ingredients." />
              <form className="admin-toolbar" onSubmit={saveInventory}>
                <select className="admin-select" value={inventoryForm.category} onChange={(event) => setInventoryForm({ ...inventoryForm, category: event.target.value })}>
                  <option value="base">Pizza base</option><option value="sauce">Sauce</option><option value="cheese">Cheese</option><option value="vegetable">Vegetable</option>
                </select>
                <input className="admin-search" placeholder="Ingredient name" value={inventoryForm.name} onChange={(event) => setInventoryForm({ ...inventoryForm, name: event.target.value })} required />
                <input className="admin-search" type="number" min="0" step="1" placeholder="Quantity" value={inventoryForm.quantity} onChange={(event) => setInventoryForm({ ...inventoryForm, quantity: event.target.value })} required />
                <input className="admin-search" type="number" min="0" step="1" placeholder="Low-stock threshold" value={inventoryForm.lowStockThreshold} onChange={(event) => setInventoryForm({ ...inventoryForm, lowStockThreshold: event.target.value })} required />
                <button className="admin-primary-button" type="submit">Save stock</button>
              </form>
              
<div className="admin-table-wrap">
  <table className="admin-table">
    <thead>
      <tr>
        <th>Ingredient</th>
        <th>Category</th>
        <th>Quantity</th>
        <th>Alert threshold</th>
        <th>Stock state</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {inventory.map((item) => (
        <tr key={item._id}>
          <td><strong>{item.name}</strong></td>
          <td>{item.category}</td>
          <td>{item.quantity}</td>
          <td>{item.lowStockThreshold}</td>
          <td>
            <StatusBadge
              status={
                item.quantity <= item.lowStockThreshold
                  ? "Low Stock"
                  : "In Stock"
              }
            />
          </td>
          <td>
            <button
              type="button"
              className="admin-primary-button"
              onClick={() =>
                setInventoryForm({
                  category: item.category,
                  name: item.name,
                  quantity: String(item.quantity),
                  lowStockThreshold: String(item.lowStockThreshold),
                  editId: item._id,
                })
              }
            >
              Edit
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  {inventory.length === 0 && (
    <div className="admin-empty">
      No inventory items configured yet. Add each ingredient and its current stock.
    </div>
  )}
</div>
            </>
          )}

          {activeTab === "settings" && !dataLoading && !dataError && (
            <>
              <SectionTitle eyebrow="YOUR WORKSPACE" title="Profile & settings" description="Manage the admin profile and dashboard preferences." />
              <div className="admin-settings-grid">
                <form className="admin-panel admin-settings-card" onSubmit={async (event) => { event.preventDefault(); try { const response = await api.put("/users/profile", { name: profile.name, phone: profile.phone }); localStorage.setItem("user", JSON.stringify({ ...signedInUser, ...response.data.user })); notify("Profile saved."); } catch (error) { notify(error.response?.data?.message || "Unable to save profile."); } }}>
                  <h3>Admin profile</h3><p>Update your account details.</p>
                  <label>Display name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label>
                  <label>Email address<input type="email" value={profile.email} readOnly /></label>
                  <label>Phone number<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
                  <div className="admin-profile-actions">
                    <button className="admin-primary-button" type="submit">Save profile</button>
                    <button className="admin-secondary-button" type="button" onClick={handleLogout}>Logout</button>
                  </div>
                </form>

                <div className="admin-panel admin-settings-card">
                  <h3>Notifications</h3><p>Choose which updates you would like to see.</p>
                  {[
                    ["orderAlerts", "New order alerts", "Know when a customer places an order."],
                    ["lowStockAlerts", "Menu availability alerts", "Keep unavailable items on your radar."],
                    ["weeklySummary", "Weekly summary", "Review your business snapshot each week."],
                  ].map(([key, label, description]) => (
                    <div className="admin-preference" key={key}>
                      <div><strong>{label}</strong><p>{description}</p></div>
                      <button type="button" className={`admin-toggle ${preferences[key] ? "on" : ""}`} onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })} aria-label={`Toggle ${label}`}><span /></button>
                    </div>
                  ))}
                  <div className="admin-settings-note"><strong>Preview mode</strong><p>Preferences stay in local state and are not persisted.</p></div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {modal === "pizza" && (
        <Modal title={editingPizza ? "Edit pizza" : "Add a pizza"} onClose={() => setModal(null)}>
          <form className="admin-modal-form admin-pizza-form" onSubmit={savePizza}>
            <section className="admin-form-section">
              <h3>Basic details</h3>
              <label>Pizza name *
                <input autoFocus value={pizzaForm.name} onChange={(event) => setPizzaForm({ ...pizzaForm, name: event.target.value })} placeholder="e.g. Spicy Paneer" required />
              </label>
              <label>Category
                <select value={pizzaForm.category} onChange={(event) => setPizzaForm({ ...pizzaForm, category: event.target.value })}>
                  <option>Veg</option><option>Non-Veg</option>
                </select>
              </label>
              <label>Description
                <textarea rows="3" value={pizzaForm.description} onChange={(event) => setPizzaForm({ ...pizzaForm, description: event.target.value })} placeholder="Describe the pizza..." />
              </label>
              <label>Image URL
                <input type="url" value={pizzaForm.image} onChange={(event) => setPizzaForm({ ...pizzaForm, image: event.target.value })} placeholder="https://example.com/pizza.jpg" />
              </label>
              {pizzaForm.image.trim() && (
                <div className="admin-image-preview">
                  <img
                    src={pizzaForm.image}
                    alt="Pizza preview"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                    onLoad={(event) => { event.currentTarget.style.display = "block"; }}
                  />
                </div>
              )}
            </section>

            <section className="admin-form-section">
              <h3>Size-wise pricing</h3>
              <div className="admin-size-grid">
                {["small", "medium", "large"].map((size) => (
                  <label key={size}>{size.charAt(0).toUpperCase() + size.slice(1)} price (₹) *
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={pizzaForm.sizes[size]}
                      onChange={(event) => setPizzaForm((previous) => ({
                        ...previous,
                        sizes: { ...previous.sizes, [size]: event.target.value },
                      }))}
                    />
                  </label>
                ))}
              </div>
            </section>

            <OptionEditor title="Crust options" field="crusts" options={pizzaForm.crusts} onUpdate={updatePizzaOption} onAdd={addPizzaOption} onRemove={removePizzaOption} />
            <OptionEditor title="Sauce options" field="sauces" options={pizzaForm.sauces} onUpdate={updatePizzaOption} onAdd={addPizzaOption} onRemove={removePizzaOption} />
            <OptionEditor title="Vegetarian toppings" field="vegToppings" options={pizzaForm.vegToppings} onUpdate={updatePizzaOption} onAdd={addPizzaOption} onRemove={removePizzaOption} />
            <OptionEditor title="Non-vegetarian toppings" field="nonVegToppings" options={pizzaForm.nonVegToppings} onUpdate={updatePizzaOption} onAdd={addPizzaOption} onRemove={removePizzaOption} />
            <OptionEditor title="Cheese options" field="cheeseOptions" options={pizzaForm.cheeseOptions} onUpdate={updatePizzaOption} onAdd={addPizzaOption} onRemove={removePizzaOption} />

            <label className="admin-modal-checkbox">
              <input type="checkbox" checked={pizzaForm.available} onChange={(event) => setPizzaForm({ ...pizzaForm, available: event.target.checked })} />
              Available on menu
            </label>

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setModal(null)}>Cancel</button>
              <button className="admin-primary-button" type="submit">{editingPizza ? "Save changes" : "Add pizza"}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "order" && selectedOrder && (
        <Modal title={`Order ${selectedOrder.id}`} onClose={() => setModal(null)}>
          <div className="admin-detail-list">
            <div><span>Customer</span><strong>{selectedOrder.customer}</strong></div>
            <div><span>Items</span><strong>{selectedOrder.items}</strong></div>
            <div><span>Order total</span><strong>{currency(selectedOrder.amount)}</strong></div>
            <div><span>Payment</span><strong>{selectedOrder.payment}</strong></div>
            <div><span>Placed</span><strong>{selectedOrder.date}</strong></div>
          </div>
          <label className="admin-status-editor">Update status
            <select value={selectedOrder.status} onChange={(event) => updateOrderStatus(selectedOrder.id, event.target.value)}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          {["Confirmed", "Preparing", "Out for Delivery", "Delivered"].includes(selectedOrder.status) && !selectedOrder.inventoryDeducted && selectedOrder.raw?.inventoryConsumptions?.length > 0 && (
            <div className="admin-settings-note">
              <strong>Inventory deduction pending</strong>
              <p>Configure the missing stock in Inventory, then retry the deduction for this order.</p>
              <button className="admin-secondary-button" onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}>Retry inventory deduction</button>
            </div>
          )}
          <div className="admin-modal-actions"><button className="admin-primary-button" onClick={() => setModal(null)}>Done</button></div>
        </Modal>
      )}

      {modal === "customer" && selectedCustomer && (
        <Modal title="Customer profile" onClose={() => setModal(null)}>
          <div className="admin-customer-profile">
            <span className="admin-customer-avatar large">{selectedCustomer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
            <h3>{selectedCustomer.name}</h3><p>{selectedCustomer.email}</p>
          </div>
          <div className="admin-detail-list">
            <div><span>Phone</span><strong>{selectedCustomer.phone}</strong></div>
            <div><span>Joined</span><strong>{selectedCustomer.joined}</strong></div>
            <div><span>Total orders</span><strong>{selectedCustomer.orders}</strong></div>
            <div><span>Sample spend</span><strong>{currency(selectedCustomer.spent)}</strong></div>
          </div>
          <div className="admin-modal-actions"><button className="admin-primary-button" onClick={() => setModal(null)}>Close</button></div>
        </Modal>
      )}

      {notice && <div className="admin-toast" role="status">{notice}</div>}
    </div>
  );
}
