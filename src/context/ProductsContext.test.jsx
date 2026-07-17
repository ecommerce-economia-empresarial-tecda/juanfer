import { renderHook, act } from '@testing-library/react';
import { ProductsProvider, useProducts } from './ProductsContext';
import { describe, it, expect, beforeEach } from 'vitest';
import { products as mockProducts } from '../mockData';

describe('ProductsContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with products from mockData if localStorage is empty', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.products).toEqual(mockProducts);
    expect(JSON.parse(window.localStorage.getItem('products_inventory'))).toEqual(mockProducts);
  });

  it('should initialize with items from localStorage if present', () => {
    const customProducts = [
      {
        id: 99,
        title: 'Custom Product',
        description: 'A custom product description',
        price: 50,
        category: 'Test',
        image: 'custom.jpg',
        stock: 5,
      },
    ];
    window.localStorage.setItem('products_inventory', JSON.stringify(customProducts));

    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.products).toEqual(customProducts);
  });

  it('should add a new product and assign a unique id', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    const newProduct = {
      title: 'New Headphones',
      description: 'Super noise canceling',
      price: 199.99,
      category: 'Electronics',
      image: 'headphones.jpg',
      stock: 12,
    };

    act(() => {
      result.current.addProduct(newProduct);
    });

    const added = result.current.products.find(p => p.title === 'New Headphones');
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
    expect(added.price).toBe(199.99);
    expect(added.stock).toBe(12);

    // Verify localStorage persistence
    const saved = JSON.parse(window.localStorage.getItem('products_inventory'));
    expect(saved.find(p => p.title === 'New Headphones')).toEqual(added);
  });

  it('should add multiple products sequentially and assign correct incremental IDs', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Initial mockProducts length is 15, max id is 15.
    const productA = { title: 'A', description: 'Desc A', price: 10, category: 'Cat', image: 'imgA.jpg', stock: 1 };
    const productB = { title: 'B', description: 'Desc B', price: 20, category: 'Cat', image: 'imgB.jpg', stock: 2 };

    act(() => {
      result.current.addProduct(productA);
    });
    const addedA = result.current.products.find(p => p.title === 'A');
    expect(addedA.id).toBe(16);

    act(() => {
      result.current.addProduct(productB);
    });
    const addedB = result.current.products.find(p => p.title === 'B');
    expect(addedB.id).toBe(17);
  });

  it('should update product details', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Update first product (id: 1)
    act(() => {
      result.current.updateProduct(1, {
        title: 'Updated Wireless Headphones',
        price: 109.99,
        stock: 4,
        category: 'Audio',
      });
    });

    const updated = result.current.products.find(p => p.id === 1);
    expect(updated.title).toBe('Updated Wireless Headphones');
    expect(updated.price).toBe(109.99);
    expect(updated.stock).toBe(4);
    expect(updated.category).toBe('Audio');

    // Verify localStorage persistence
    const saved = JSON.parse(window.localStorage.getItem('products_inventory'));
    expect(saved.find(p => p.id === 1)).toEqual(updated);
  });

  it('should delete a product', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Initial check
    expect(result.current.products.some(p => p.id === 1)).toBe(true);

    act(() => {
      result.current.deleteProduct(1);
    });

    expect(result.current.products.some(p => p.id === 1)).toBe(false);

    // Verify localStorage persistence
    const saved = JSON.parse(window.localStorage.getItem('products_inventory'));
    expect(saved.some(p => p.id === 1)).toBe(false);
  });

  it('should decrement product stock', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Product 1 has stock: 5 initially
    const initialStock = result.current.products.find(p => p.id === 1).stock;
    expect(initialStock).toBe(5);

    act(() => {
      result.current.decrementStock(1, 2);
    });

    const updated = result.current.products.find(p => p.id === 1);
    expect(updated.stock).toBe(3);

    // Verify localStorage persistence
    const saved = JSON.parse(window.localStorage.getItem('products_inventory'));
    expect(saved.find(p => p.id === 1).stock).toBe(3);
  });

  it('should allow decrementing stock to exactly zero', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Product 1 has stock: 5 initially
    act(() => {
      result.current.decrementStock(1, 5);
    });

    const updated = result.current.products.find(p => p.id === 1);
    expect(updated.stock).toBe(0);
  });

  it('should throw an error if decrement stock is below zero', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    // Product 1 has stock: 5 initially
    expect(() => {
      act(() => {
        result.current.decrementStock(1, 6);
      });
    }).toThrow('Insufficient stock');

    // Verify stock is unchanged
    const updated = result.current.products.find(p => p.id === 1);
    expect(updated.stock).toBe(5);
  });

  it('should throw an error if trying to decrement stock of a non-existent product', () => {
    const wrapper = ({ children }) => <ProductsProvider>{children}</ProductsProvider>;
    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(() => {
      act(() => {
        result.current.decrementStock(999, 1);
      });
    }).toThrow('Product not found');
  });
});
