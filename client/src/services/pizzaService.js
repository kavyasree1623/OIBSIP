import api from "./api";
import { withPizzaImage, withPizzaImages } from "./pizzaImages";

export const getPizzas = async () => {
  const response = await api.get("/pizzas");

  return { ...response.data, pizzas: withPizzaImages(response.data.pizzas) };
};

export const getPizzaById = async (pizzaId) => {
  const response = await api.get(`/pizzas/${pizzaId}`);

  return { ...response.data, pizza: withPizzaImage(response.data.pizza) };
};
