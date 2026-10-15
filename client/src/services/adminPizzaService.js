import api from "./api";

const adminPizzaService = {
  async getAll() {
    const response = await api.get("/pizzas/admin/all");
    return response.data;
  },

  async create(pizzaData) {
    const response = await api.post("/pizzas", pizzaData);
    return response.data;
  },

  async update(id, pizzaData) {
    const response = await api.put(`/pizzas/${id}`, pizzaData);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/pizzas/${id}`);
    return response.data;
  },
};

export default adminPizzaService;