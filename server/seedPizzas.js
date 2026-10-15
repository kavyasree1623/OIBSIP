require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Pizza = require("./models/Pizza");

const crusts = [
  { name: "Classic Hand Tossed", price: 0 },
  { name: "Thin & Crispy", price: 30 },
  { name: "Pan Crust", price: 40 },
  { name: "Whole Wheat", price: 40 },
  { name: "Cheese Burst", price: 70 },
];

const sauces = [
  { name: "Classic Pizza Sauce", price: 0 },
  { name: "Creamy Garlic", price: 20 },
  { name: "Peri Peri", price: 20 },
  { name: "BBQ Sauce", price: 25 },
  { name: "Pesto", price: 30 },
];

const vegToppings = [
  { name: "Onion", price: 20 },
  { name: "Capsicum", price: 20 },
  { name: "Tomato", price: 20 },
  { name: "Mushroom", price: 25 },
  { name: "Sweet Corn", price: 20 },
  { name: "Black Olives", price: 25 },
  { name: "Jalapeño", price: 20 },
  { name: "Spinach", price: 20 },
  { name: "Baby Corn", price: 25 },
  { name: "Red Paprika", price: 20 },
];

const nonVegToppings = [
  { name: "Chicken Tikka", price: 60 },
  { name: "BBQ Chicken", price: 70 },
  { name: "Peri Peri Chicken", price: 70 },
  { name: "Tandoori Chicken", price: 70 },
  { name: "Chicken Sausage", price: 60 },
  { name: "Chicken Pepperoni", price: 80 },
];

const cheeseOptions = [
  { name: "Regular Cheese", price: 0 },
  { name: "Extra Cheese", price: 40 },
  { name: "Double Cheese", price: 70 },
];

const pizzas = [
  {
    name: "Margherita",
    description: "Classic pizza with tomato, mozzarella and fresh basil.",
    category: "Veg",
    price: 299,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 199,
      medium: 299,
      large: 399,
    },
  },

  {
    name: "Farmhouse",
    description: "Fresh vegetables, onion, capsicum, tomato and mushroom.",
    category: "Veg",
    price: 349,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 249,
      medium: 349,
      large: 449,
    },
  },

  {
    name: "Veggie Supreme",
    description: "Loaded with onion, capsicum, corn, mushroom and olives.",
    category: "Veg",
    price: 379,
    image: "https://images.unsplash.com/photo-1788537894898-6e90a3abeea1?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 279,
      medium: 379,
      large: 479,
    },
  },

  {
    name: "Paneer Tikka",
    description: "Tandoori paneer with onion, capsicum and mozzarella.",
    category: "Veg",
    price: 379,
    image: "https://images.unsplash.com/photo-1665033628673-7de125eb6b12?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 279,
      medium: 379,
      large: 479,
    },
  },

  {
    name: "Cheese & Corn",
    description: "Sweet corn, mozzarella and generous layers of cheese.",
    category: "Veg",
    price: 299,
    image: "https://images.unsplash.com/photo-1756361630126-86810862af91?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 219,
      medium: 299,
      large: 399,
    },
  },

  {
    name: "Mexican Green Wave",
    description: "Capsicum, jalapeño, onion, corn and black olives.",
    category: "Veg",
    price: 379,
    image: "https://images.unsplash.com/photo-1706953450298-a628053ab0ae?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 279,
      medium: 379,
      large: 479,
    },
  },

  {
    name: "Mushroom Delight",
    description: "Mushroom, onion, capsicum and creamy melted cheese.",
    category: "Veg",
    price: 349,
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 249,
      medium: 349,
      large: 449,
    },
  },

  {
    name: "Spinach & Corn",
    description: "Fresh spinach, sweet corn, onion and cheese.",
    category: "Veg",
    price: 349,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 249,
      medium: 349,
      large: 449,
    },
  },

  {
    name: "Peri Peri Paneer",
    description: "Spicy peri peri paneer with capsicum and onion.",
    category: "Veg",
    price: 399,
    image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 299,
      medium: 399,
      large: 499,
    },
  },

  {
    name: "Garden Fresh",
    description: "A fresh combination of tomato, onion, capsicum, mushroom and spinach.",
    category: "Veg",
    price: 379,
    image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 279,
      medium: 379,
      large: 479,
    },
  },

  {
    name: "Chicken Tikka",
    description: "Juicy chicken tikka with onion, capsicum and cheese.",
    category: "Non-Veg",
    price: 399,
    image: "https://images.unsplash.com/photo-1767065603441-61923212f80c?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 299,
      medium: 399,
      large: 499,
    },
  },

  {
    name: "Chicken Supreme",
    description: "Chicken, onion, capsicum, mushroom and mozzarella.",
    category: "Non-Veg",
    price: 429,
    image: "https://images.unsplash.com/photo-1767065603116-8cee3bf11372?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 329,
      medium: 429,
      large: 529,
    },
  },

  {
    name: "BBQ Chicken",
    description: "Smoky BBQ chicken with onion and melted mozzarella.",
    category: "Non-Veg",
    price: 419,
    image: "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 319,
      medium: 419,
      large: 519,
    },
  },

  {
    name: "Peri Peri Chicken",
    description: "Spicy peri peri chicken with capsicum and onion.",
    category: "Non-Veg",
    price: 429,
    image: "https://images.unsplash.com/photo-1607929298871-fbdcf7e84852?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 329,
      medium: 429,
      large: 529,
    },
  },

  {
    name: "Chicken Pepperoni",
    description: "Chicken pepperoni with mozzarella and classic pizza sauce.",
    category: "Non-Veg",
    price: 449,
    image: "https://images.unsplash.com/photo-1602658014714-26b99d5a45cf?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 349,
      medium: 449,
      large: 549,
    },
  },

  {
    name: "Chicken Sausage",
    description: "Chicken sausage, onion, capsicum and mozzarella.",
    category: "Non-Veg",
    price: 399,
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 299,
      medium: 399,
      large: 499,
    },
  },

  {
    name: "Chicken & Corn",
    description: "Tender chicken with sweet corn and melted cheese.",
    category: "Non-Veg",
    price: 399,
    image: "https://images.unsplash.com/photo-1578301807752-33631801f8aa?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 299,
      medium: 399,
      large: 499,
    },
  },

  {
    name: "Spicy Chicken",
    description: "Spiced chicken with jalapeño, onion and mozzarella.",
    category: "Non-Veg",
    price: 419,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 319,
      medium: 419,
      large: 519,
    },
  },

  {
    name: "Tandoori Chicken",
    description: "Tandoori chicken with onion, capsicum and cheese.",
    category: "Non-Veg",
    price: 429,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 329,
      medium: 429,
      large: 529,
    },
  },

  {
    name: "Loaded Chicken",
    description: "Loaded with chicken, sausage, pepperoni, onion and capsicum.",
    category: "Non-Veg",
    price: 479,
    image: "https://images.unsplash.com/photo-1548365328-8b849e6f4b99?auto=format&fit=crop&w=1200&q=80",
    sizes: {
      small: 379,
      medium: 479,
      large: 579,
    },
  },
];

const seedPizzas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected for pizza seeding.");

    await Pizza.deleteMany({});

    const pizzasWithOptions = pizzas.map((pizza) => ({
      ...pizza,
      crusts,
      sauces,
      vegToppings,
      nonVegToppings,
      cheeseOptions,
      available: true,
    }));

    const createdPizzas = await Pizza.insertMany(pizzasWithOptions);

    console.log(
      `${createdPizzas.length} pizzas inserted successfully.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Pizza seeding failed:");
    console.error(error);
    process.exit(1);
  }
};

seedPizzas();
