/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { products as mockProducts } from '../mockData';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, runTransaction } from 'firebase/firestore';

const ProductsContext = createContext();

const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export function ProductsProvider({ children }) {
  // --- Local State for Testing ---
  const [localProducts, setLocalProducts] = useState(() => {
    if (typeof window === 'undefined') return mockProducts;
    try {
      const stored = window.localStorage.getItem('products_inventory');
      return stored ? JSON.parse(stored) : mockProducts;
    } catch (e) {
      return mockProducts;
    }
  });

  useEffect(() => {
    if (!isTestEnv) return;
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('products_inventory', JSON.stringify(localProducts));
  }, [localProducts]);

  // --- Firestore State for Production ---
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    if (isTestEnv) return;
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: Number(doc.id) });
      });

      if (list.length === 0 && mockProducts.length > 0) {
        mockProducts.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', String(p.id)), p);
          } catch (err) {
            console.error("Error seeding product:", p.id, err);
          }
        });
      } else {
        list.sort((a, b) => a.id - b.id);
        setDbProducts(list);
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Expose appropriate list
  const products = isTestEnv ? localProducts : dbProducts;

  const addProduct = async (productData) => {
    if (isTestEnv) {
      setLocalProducts((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
        return [...prev, { ...productData, id: nextId }];
      });
      return;
    }
    const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    await setDoc(doc(db, 'products', String(nextId)), { ...productData, id: nextId });
  };

  const updateProduct = async (id, updatedFields) => {
    if (isTestEnv) {
      setLocalProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...updatedFields } : product
        )
      );
      return;
    }
    await updateDoc(doc(db, 'products', String(id)), updatedFields);
  };

  const deleteProduct = async (id) => {
    if (isTestEnv) {
      setLocalProducts((prev) => prev.filter((product) => product.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'products', String(id)));
  };

  const decrementStock = async (id, quantity) => {
    if (isTestEnv) {
      setLocalProducts((prev) => {
        const product = prev.find((p) => p.id === id);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');
        return prev.map((p) =>
          p.id === id ? { ...p, stock: p.stock - quantity } : p
        );
      });
      return;
    }

    const productRef = doc(db, 'products', String(id));
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(productRef);
      if (!sfDoc.exists()) {
        throw new Error("Product does not exist!");
      }
      const newStock = sfDoc.data().stock - quantity;
      if (newStock < 0) {
        throw new Error("Insufficient stock!");
      }
      transaction.update(productRef, { stock: newStock });
    });
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        decrementStock,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
