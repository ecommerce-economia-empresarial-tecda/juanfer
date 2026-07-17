import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App Integration and Views', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the product catalog by default and allows drawer toggling', () => {
    render(<App />);

    // Catalog view check (should find categories filter dropdown and grid)
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
    expect(screen.getByText(/Antigravity Shop/i)).toBeInTheDocument();

    // Drawer should not be visible initially
    expect(screen.queryByTestId('cart-drawer')).not.toBeInTheDocument();

    // Open Cart Drawer
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    fireEvent.click(cartToggleBtn);
    expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument();

    // Close Cart Drawer
    const closeDrawerBtn = screen.getByRole('button', { name: /close cart/i });
    fireEvent.click(closeDrawerBtn);
    expect(screen.queryByTestId('cart-drawer')).not.toBeInTheDocument();
  });

  it('allows navigating to checkout and returning back to catalog', () => {
    render(<App />);

    // Add a product to cart first to enable Checkout button
    // Our mock products should contain some items, e.g. "Smartphone" or similar.
    // Let's find one of the product card buttons and click it
    const addBtn = screen.getAllByRole('button', { name: /add to cart/i })[0];
    fireEvent.click(addBtn);

    // Open drawer
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    fireEvent.click(cartToggleBtn);

    // Click Proceed to Checkout
    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutBtn);

    // Verify view has changed to Checkout
    expect(screen.getByText(/checkout details/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /filter by category/i })).not.toBeInTheDocument();

    // Back to Shop button
    const backBtn = screen.getByRole('button', { name: /back to shop/i });
    fireEvent.click(backBtn);

    // Verify we are back on catalog
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
    expect(screen.queryByText(/checkout details/i)).not.toBeInTheDocument();
  });

  it('updates the cart badge quantity dynamically in the navbar', () => {
    render(<App />);

    // Initially count badge should be 0
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    expect(cartToggleBtn).toHaveTextContent('Cart 0');

    // Add first product
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    fireEvent.click(addButtons[0]);
    expect(cartToggleBtn).toHaveTextContent('Cart 1');

    // Add second product
    fireEvent.click(addButtons[1]);
    expect(cartToggleBtn).toHaveTextContent('Cart 2');
  });
});
