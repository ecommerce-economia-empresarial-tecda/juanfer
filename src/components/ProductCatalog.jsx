import { useState } from 'react';
import ProductCard from './ProductCard';
import { products as defaultProducts } from '../mockData';

export default function ProductCatalog({ products = defaultProducts }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive unique categories from products
  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
