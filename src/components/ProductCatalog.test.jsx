import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from '../context/CartContext';
import ProductCatalog from './ProductCatalog';
import { describe, it, expect, beforeEach } from 'vitest';

const testProducts = [
  {
    id: 1,
    title: 'Product A',
    description: 'Test Product A Description',
    price: 10.00,
    category: 'Category 1',
    image: 'imageA.jpg',
    stock: 5,
  },
  {
    id: 2,
    title: 'Product B',
    description: 'Test Product B Description',
    price: 20.00,
    category: 'Category 2',
    image: 'imageB.jpg',
    stock: 0,
  },
  {
    id: 3,
    title: 'Product C',
    description: 'Test Product C Description',
    price: 15.00,
    category: 'Category 1',
    image: 'imageC.jpg',
    stock: 2,
  }
];

const renderCatalog = (products = testProducts) => {
  return render(
    <CartProvider>
      <ProductCatalog products={products} />
    </CartProvider>
  );
};

describe('ProductCatalog Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders all products with their details (title, description, price, category, image)', () => {
    renderCatalog();

    // Check title rendering
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();

    // Check description rendering
    expect(screen.getByText('Test Product A Description')).toBeInTheDocument();
    expect(screen.getByText('Test Product C Description')).toBeInTheDocument();

    // Check price rendering
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();

    // Check category rendering on product cards specifically
    const productACard = screen.getByText('Product A').closest('.product-card');
    const productCCard = screen.getByText('Product C').closest('.product-card');
    
    expect(productACard.querySelector('.product-category')).toHaveTextContent('Category 1');
    expect(productCCard.querySelector('.product-category')).toHaveTextContent('Category 1');

    // Check image rendering (alt text and src)
    const images = screen.getAllByRole('img');
    const imageSrcs = images.map(img => img.getAttribute('src'));
    expect(imageSrcs).toContain('imageA.jpg');
    expect(imageSrcs).toContain('imageC.jpg');
  });

  it('filters products by category dropdown', () => {
    renderCatalog();

    // The dropdown selector should exist and default to "All"
    const select = screen.getByRole('combobox', { name: /filter by category/i });
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('All');

    // Initially all products are rendered
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();

    // Select "Category 1"
    fireEvent.change(select, { target: { value: 'Category 1' } });

    // Product A and Product C should be visible, Product B should not
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();
    expect(screen.queryByText('Product B')).not.toBeInTheDocument();

    // Select "Category 2"
    fireEvent.change(select, { target: { value: 'Category 2' } });

    // Only Product B should be visible
    expect(screen.queryByText('Product A')).not.toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.queryByText('Product C')).not.toBeInTheDocument();

    // Select "All"
    fireEvent.change(select, { target: { value: 'All' } });
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();
  });

  it('handles "Sold Out" state when stock is 0', () => {
    renderCatalog();

    // Product B has stock 0
    const productBElement = screen.getByText('Product B').closest('.product-card');
    expect(productBElement).toBeInTheDocument();

    // Should display a "Sold Out" indicator/badge
    const soldOutBadge = screen.getByText('Sold Out', { selector: '.sold-out-badge' });
    expect(soldOutBadge).toBeInTheDocument();
    expect(productBElement).toContainElement(soldOutBadge);

    // The Add to Cart button should be disabled and say "Sold Out"
    const button = screen.getByRole('button', { name: /sold out/i });
    expect(button).toBeDisabled();
  });

  it('handles disabled state when product stock is fully exhausted in the cart', () => {
    // Product C has stock 2
    renderCatalog();

    const addToCartButton = screen.getByRole('button', { name: /add to cart product c/i });
    expect(addToCartButton).toHaveTextContent(/add to cart/i);
    expect(addToCartButton).not.toBeDisabled();

    // Click twice to add Product C to the cart (exhausting stock level of 2)
    fireEvent.click(addToCartButton);
    fireEvent.click(addToCartButton);

    // Now that the 2 stock items are in the cart, the Add to Cart button for Product C must be disabled
    expect(addToCartButton).toBeDisabled();
  });

  it('triangulates catalog rendering and category filtering with a different set of products', () => {
    const triangulatedProducts = [
      {
        id: 10,
        title: 'Book A',
        description: 'Interesting Book A',
        price: 5.99,
        category: 'Books',
        image: 'bookA.jpg',
        stock: 3,
      },
      {
        id: 11,
        title: 'Toy B',
        description: 'Fun Toy B',
        price: 12.50,
        category: 'Toys',
        image: 'toyB.jpg',
        stock: 1,
      }
    ];

    renderCatalog(triangulatedProducts);

    // Verify correct items are rendered
    expect(screen.getByText('Book A')).toBeInTheDocument();
    expect(screen.getByText('Toy B')).toBeInTheDocument();
    expect(screen.queryByText('Product A')).not.toBeInTheDocument();

    // The dropdown selector should now contain "All", "Books", "Toys"
    const select = screen.getByRole('combobox', { name: /filter by category/i });
    expect(select).toBeInTheDocument();
    
    // Select "Books"
    fireEvent.change(select, { target: { value: 'Books' } });
    expect(screen.getByText('Book A')).toBeInTheDocument();
    expect(screen.queryByText('Toy B')).not.toBeInTheDocument();

    // Select "Toys"
    fireEvent.change(select, { target: { value: 'Toys' } });
    expect(screen.queryByText('Book A')).not.toBeInTheDocument();
    expect(screen.getByText('Toy B')).toBeInTheDocument();
  });
});
