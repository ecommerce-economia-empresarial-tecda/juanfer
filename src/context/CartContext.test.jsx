import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { describe, it, expect, beforeEach } from 'vitest';

const mockProductA = {
  id: 1,
  title: 'Product A',
  description: 'Test Product A',
  price: 10,
  category: 'Test',
  image: 'testA.jpg',
  stock: 5,
};

const mockProductB = {
  id: 2,
  title: 'Product B',
  description: 'Test Product B',
  price: 20,
  category: 'Test',
  image: 'testB.jpg',
  stock: 2,
};

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with an empty cart if localStorage is empty', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartTotal).toBe(0);
  });

  it('should initialize with items from localStorage', () => {
    const initialCart = [{ ...mockProductA, quantity: 2 }];
    window.localStorage.setItem('cart_items', JSON.stringify(initialCart));

    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual(initialCart);
    expect(result.current.cartTotal).toBe(20);
  });

  it('should add a product to the cart and update total price', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });

    expect(result.current.cart).toEqual([{ ...mockProductA, quantity: 1 }]);
    expect(result.current.cartTotal).toBe(10);
    expect(JSON.parse(window.localStorage.getItem('cart_items'))).toEqual([
      { ...mockProductA, quantity: 1 },
    ]);
  });

  it('should increment quantity when adding an existing product', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });
    act(() => {
      result.current.addToCart(mockProductA);
    });

    expect(result.current.cart).toEqual([{ ...mockProductA, quantity: 2 }]);
    expect(result.current.cartTotal).toBe(20);
  });

  it('should enforce stock limits when adding items', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    // Stock limit of mockProductB is 2
    act(() => {
      result.current.addToCart(mockProductB);
    });
    act(() => {
      result.current.addToCart(mockProductB);
    });
    act(() => {
      result.current.addToCart(mockProductB); // Should exceed stock limit
    });

    expect(result.current.cart).toEqual([{ ...mockProductB, quantity: 2 }]);
    expect(result.current.cartTotal).toBe(40);
  });

  it('should update item quantity and enforce stock limits', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });

    act(() => {
      result.current.updateQuantity(mockProductA.id, 4);
    });
    expect(result.current.cart[0].quantity).toBe(4);
    expect(result.current.cartTotal).toBe(40);

    act(() => {
      result.current.updateQuantity(mockProductA.id, 6); // Exceeds stock (5)
    });
    expect(result.current.cart[0].quantity).toBe(5); // Capped at stock
    expect(result.current.cartTotal).toBe(50);
  });

  it('should remove item from cart and update total price', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });
    act(() => {
      result.current.addToCart(mockProductB);
    });

    expect(result.current.cartTotal).toBe(30);

    act(() => {
      result.current.removeFromCart(mockProductA.id);
    });

    expect(result.current.cart).toEqual([{ ...mockProductB, quantity: 1 }]);
    expect(result.current.cartTotal).toBe(20);
  });

  it('should clear all items from cart', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });
    act(() => {
      result.current.addToCart(mockProductB);
    });

    expect(result.current.cart.length).toBe(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartTotal).toBe(0);
    expect(window.localStorage.getItem('cart_items')).toBeNull();
  });

  it('should not add a product to the cart if stock is 0', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    const zeroStockProduct = { ...mockProductA, id: 99, stock: 0 };
    act(() => {
      result.current.addToCart(zeroStockProduct);
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartTotal).toBe(0);
  });

  it('should cap updateQuantity to 1 if quantity is less than 1', () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProductA);
    });

    act(() => {
      result.current.updateQuantity(mockProductA.id, 0);
    });
    expect(result.current.cart[0].quantity).toBe(1);
    expect(result.current.cartTotal).toBe(10);

    act(() => {
      result.current.updateQuantity(mockProductA.id, -5);
    });
    expect(result.current.cart[0].quantity).toBe(1);
    expect(result.current.cartTotal).toBe(10);
  });
});
