import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App Complete Integration Checkout Flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('verifies the complete checkout flow from catalog to order confirmation', async () => {
    render(<App />);

    // 1. Verify Catalog is rendered
    expect(screen.getByText(/Antigravity Shop/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();

    // 2. Add multiple products to the cart
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(2);

    // Let's add the first product (Wireless Headphones - price: 99.99, stock: 5)
    fireEvent.click(addButtons[0]);
    // Let's add the second product (Minimalist Leather Watch - price: 149.50, stock: 2)
    fireEvent.click(addButtons[1]);

    // 3. Open the cart drawer and verify totals
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    expect(cartToggleBtn).toHaveTextContent('Cart 2');
    fireEvent.click(cartToggleBtn);

    const cartDrawer = screen.getByTestId('cart-drawer');
    expect(cartDrawer).toBeInTheDocument();

    // Verify cart total: 99.99 + 149.50 = 249.49
    expect(screen.getByText(/\$249\.49/)).toBeInTheDocument();

    // 4. Click Proceed to Checkout to navigate to the checkout form
    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutBtn);

    // Verify we navigated to checkout view
    expect(screen.getByRole('heading', { name: /checkout details/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /filter by category/i })).not.toBeInTheDocument();

    // 5. Fill in Name, Email, Address, Card fields and submit
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '789 Space Blvd, Colony 1' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1111222233334444' } });

    // Mock initial check: set some dummy item in local storage to verify it is cleared
    window.localStorage.setItem('cart_items', JSON.stringify([{ id: 1, quantity: 1 }]));

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    // 6. Verify that the order confirmation modal is displayed with a generated order ID
    const modal = await screen.findByTestId('order-confirmation-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/order placement successful/i)).toBeInTheDocument();

    // Check that there is an order ID displayed
    const orderIdText = screen.getByText(/order id:/i);
    expect(orderIdText).toBeInTheDocument();
    expect(orderIdText.parentElement.textContent).toMatch(/ORD-\d+-\d+/);

    // Verify that the cart is cleared (badge count should show Cart 0)
    const cartToggleBtnAfter = screen.getByRole('button', { name: /open cart/i });
    expect(cartToggleBtnAfter).toHaveTextContent('Cart 0');

    // Verify that local storage is cleared
    await waitFor(() => {
      expect(window.localStorage.getItem('cart_items')).toBeNull();
    });

    // Verify that closing the modal redirects the user back to the product catalog
    const closeModalBtn = screen.getByRole('button', { name: /close confirmation/i });
    fireEvent.click(closeModalBtn);

    // Assert that we are redirected back to the product catalog (combobox is visible again)
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
  });

  it('verifies checkout flow with form validation errors and recovery', async () => {
    render(<App />);

    // Add Denim Jacket (Clothing)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    // First button is Wireless Headphones, third button is Denim Jacket
    fireEvent.click(addButtons[2]);

    // Open drawer
    const cartToggleBtn = screen.getByRole('button', { name: /open cart/i });
    expect(cartToggleBtn).toHaveTextContent('Cart 1');
    fireEvent.click(cartToggleBtn);

    // Proceed to Checkout
    const checkoutBtn = screen.getByRole('button', { name: /proceed to checkout/i });
    fireEvent.click(checkoutBtn);

    // Try to complete order with invalid card and invalid email
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Smith' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alex-invalid-email' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '100 Orbit Way' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '9999' } });

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    // Verify error messages
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    expect(screen.getByText(/credit card must be exactly 16 digits/i)).toBeInTheDocument();

    // Verify modal does NOT appear
    expect(screen.queryByTestId('order-confirmation-modal')).not.toBeInTheDocument();

    // Correct the details
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'alex.smith@nasa.gov' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '9999888877776666' } });

    // Submit again
    fireEvent.click(submitBtn);

    // Verify that the order confirmation modal is now displayed
    const modal = await screen.findByTestId('order-confirmation-modal');
    expect(modal).toBeInTheDocument();

    // Verify order ID display
    const orderIdText = screen.getByText(/order id:/i);
    expect(orderIdText.parentElement.textContent).toMatch(/ORD-\d+-\d+/);

    // Verify cart count cleared
    const cartToggleBtnAfter = screen.getByRole('button', { name: /open cart/i });
    expect(cartToggleBtnAfter).toHaveTextContent('Cart 0');

    // Close confirmation modal
    const closeModalBtn = screen.getByRole('button', { name: /close confirmation/i });
    fireEvent.click(closeModalBtn);

    // Assert that we are redirected back to the product catalog
    expect(screen.getByRole('combobox', { name: /filter by category/i })).toBeInTheDocument();
  });
});
