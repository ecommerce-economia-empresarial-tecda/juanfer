/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem('cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse cart items from localStorage, resetting to empty cart.', e);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cart.length === 0) {
      window.localStorage.removeItem('cart_items');
    } else {
      window.localStorage.setItem('cart_items', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: product.stock } : item
          );
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, Math.min(quantity, item.stock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = Number(
    cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
