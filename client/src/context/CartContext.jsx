import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const createCustomizationKey = (
    pizzaId,
    size,
    crust,
    sauce,
    toppings,
    extraCheese
  ) => {
    const toppingNames = toppings
      .map((item) =>
        typeof item === "string" ? item : item.name
      )
      .filter(Boolean)
      .sort()
      .join("|");

    return [
      String(pizzaId),
      String(size),
      String(crust),
      String(sauce),
      toppingNames,
      String(extraCheese),
    ].join("::");
  };

  const addToCart = (
    pizza,
    size = "medium",
    customization = {}
  ) => {
    const {
      crust = "Classic",
      sauce = "Tomato",
      toppings = [],
      extraCheese = false,
      quantity = 1,
      price = pizza.sizes[size],
    } = customization;

    const customizationKey = createCustomizationKey(
      pizza._id,
      size,
      crust,
      sauce,
      toppings,
      extraCheese
    );

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.customizationKey === customizationKey
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.customizationKey === customizationKey
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          pizzaId: pizza._id,
          name: pizza.name,
          image: pizza.image,
          size,
          crust,
          sauce,
          toppings,
          extraCheese,
          price,
          quantity,
          customizationKey,
        },
      ];
    });
  };

  const removeFromCart = (customizationKey) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.customizationKey !== customizationKey
      )
    );
  };

  const increaseQuantity = (customizationKey) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.customizationKey === customizationKey
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (customizationKey) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.customizationKey === customizationKey
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// The context hook intentionally shares this context module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
