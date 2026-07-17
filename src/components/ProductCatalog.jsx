import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductsContext';

export default function ProductCatalog() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive unique categories from products
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);


  return (
    <div className="product-catalog">
      <div className="catalog-header">
        <label htmlFor="category-select" className="sr-only">
          Filter by Category
        </label>
        <select
          id="category-select"
          aria-label="Filter by Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
