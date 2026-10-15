const imagesByPizzaName = {
  "Margherita": "photo-1574071318508-1cdbab80d002",
  "Farmhouse": "photo-1565299624946-b28f40a0ae38",
  "Veggie Supreme": "photo-1788537894898-6e90a3abeea1",
  "Paneer Tikka": "photo-1665033628673-7de125eb6b12",
  "Cheese & Corn": "photo-1756361630126-86810862af91",
  "Mexican Green Wave": "photo-1706953450298-a628053ab0ae",
  "Mushroom Delight": "photo-1579751626657-72bc17010498",
  "Spinach & Corn": "photo-1593560708920-61dd98c46a4e",
  "Peri Peri Paneer": "photo-1594007654729-407eedc4be65",
  "Garden Fresh": "photo-1566843972142-a7fcb70de55a",
  "Chicken Tikka": "photo-1767065603441-61923212f80c",
  "Chicken Supreme": "photo-1767065603116-8cee3bf11372",
  "BBQ Chicken": "photo-1692737580547-b45bb4a02356",
  "Peri Peri Chicken": "photo-1607929298871-fbdcf7e84852",
  "Chicken Pepperoni": "photo-1602658014714-26b99d5a45cf",
  "Chicken Sausage": "photo-1534308983496-4fabb1a015ee",
  "Chicken & Corn": "photo-1578301807752-33631801f8aa",
  "Spicy Chicken": "photo-1513104890138-7c749659a591",
  "Tandoori Chicken": "photo-1571407970349-bc81e7e96d47",
  "Loaded Chicken": "photo-1548365328-8b849e6f4b99",
};

export function withPizzaImage(pizza) {
  const photoId = imagesByPizzaName[pizza?.name];
  if (!photoId) return pizza;

  return {
    ...pizza,
    image: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`,
  };
}

export function withPizzaImages(pizzas = []) {
  return pizzas.map(withPizzaImage);
}
