import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App Integration and Views', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('auth_current_view', 'catalog');
  });
  it('renders the homepage by default when no saved view exists', () => {
    window.localStorage.clear();
    render(<App />);
    expect(screen.getByText(/Offers & Promociones/i)).toBeInTheDocument();
  });
  // ─── Existing Tests ──────────────────────────────────────────────────────────

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

  // ─── Task 3.1 New Tests ───────────────────────────────────────────────────────

  it('guest user can browse the catalog without logging in', () => {
    render(<App />);

    // The catalog filter and shop brand should be visible without authentication
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
    expect(screen.getByText(/Antigravity Shop/i)).toBeInTheDocument();
    // Login form should NOT be visible for guests on the default catalog view
    expect(screen.queryByRole('heading', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('guest clicking "Proceed to Checkout" is redirected to the login view', () => {
    render(<App />);

    // Add a product to cart so the checkout button is enabled
    const addBtn = screen.getAllByRole('button', { name: /add to cart/i })[0];
    fireEvent.click(addBtn);

    // Open cart drawer
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    fireEvent.click(cartToggleBtn);

    // Click Proceed to Checkout as a guest
    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutBtn);

    // Should be redirected to login, not checkout
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    // Catalog filter should be gone
    expect(screen.queryByRole('combobox', { name: /filter by category/i })).not.toBeInTheDocument();
    // Checkout form should not be visible
    expect(screen.queryByText(/checkout details/i)).not.toBeInTheDocument();
  });

  it('after logging in as a customer, the user is redirected to checkout view', async () => {
    render(<App />);

    // Add item to cart and trigger guest checkout → lands on login
    const addBtn = screen.getAllByRole('button', { name: /add to cart/i })[0];
    fireEvent.click(addBtn);
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    fireEvent.click(cartToggleBtn);
    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutBtn);

    // Now we should be on the login form
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();

    // Fill in customer credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'customer@juanfershop.com' } });
    fireEvent.change(passwordInput, { target: { value: 'customerJFS2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    // After login, should be on checkout (not login, not catalog)
    expect(await screen.findByText(/checkout details/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('after logging in as admin, only AdminDashboard is rendered (no catalog or cart)', () => {
    // Seed admin session in localStorage before render
    window.localStorage.setItem('auth_user', JSON.stringify({ email: 'admin@juanfershop.com', role: 'admin' }));
    window.localStorage.setItem('auth_current_view', 'admin');

    render(<App />);

    // Admin Dashboard heading should be visible
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
    // Catalog filter dropdown should NOT be visible
    expect(screen.queryByRole('combobox', { name: /filter by category/i })).not.toBeInTheDocument();
    // Cart toggle button should NOT be visible
    expect(screen.queryByRole('button', { name: /open cart/i })).not.toBeInTheDocument();
  });

  it('triangulate: guest visiting the catalog sees products but no admin dashboard', () => {
    render(<App />);

    // Catalog elements should be visible
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
    // Admin dashboard should not appear
    expect(screen.queryByRole('heading', { name: /admin dashboard/i })).not.toBeInTheDocument();
  });

  it('app wraps the component tree in AuthProvider, ProductsProvider, and CartProvider', () => {
    // Verify that rendering App does NOT throw context errors (the providers are present).
    // If providers were missing, useAuth/useProducts/useCart would throw inside child components.
    expect(() => render(<App />)).not.toThrow();

    // Additionally, the catalog view must render correctly (requires ProductsProvider + CartProvider)
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
  });

  it('navigating to checkout as customer (from catalog) and back to shop works', () => {
    // Log in as customer directly via localStorage
    window.localStorage.setItem('auth_user', JSON.stringify({ email: 'customer@juanfershop.com', role: 'customer' }));
    window.localStorage.setItem('auth_current_view', 'checkout');

    render(<App />);

    // Should be on checkout view
    expect(screen.getByText(/checkout details/i)).toBeInTheDocument();

    // Go back to catalog
    const backBtn = screen.getByRole('button', { name: /back to shop/i });
    fireEvent.click(backBtn);

    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
    expect(screen.queryByText(/checkout details/i)).not.toBeInTheDocument();
  });
});
