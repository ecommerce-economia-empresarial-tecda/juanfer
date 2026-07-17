import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Harness to manage cart addition and wrap the CheckoutForm in a CartProvider
function CheckoutTestHarness({ initialProducts = [], onCheckoutSuccess = () => {} }) {
  return (
    <CartProvider>
      <CartActionsAndCheckout initialProducts={initialProducts} onCheckoutSuccess={onCheckoutSuccess} />
    </CartProvider>
  );
}

function CartActionsAndCheckout({ initialProducts, onCheckoutSuccess }) {
  const { cart, addToCart } = useCart();
  return (
    <div>
      {initialProducts.map(p => (
        <button key={p.id} onClick={() => addToCart(p)} data-testid={`add-${p.id}`}>
          Add {p.title}
        </button>
      ))}
      <div data-testid="cart-count">Items in Cart: {cart.length}</div>
      <CheckoutForm onCheckoutSuccess={onCheckoutSuccess} />
    </div>
  );
}

describe('CheckoutForm Component', () => {
  const testProduct = {
    id: 99,
    title: 'Checkout Product',
    description: 'A test product for checkout',
    price: 15.00,
    category: 'Test',
    image: 'test.jpg',
    stock: 5
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders validation errors on empty fields when submitted', async () => {
    render(<CheckoutTestHarness initialProducts={[testProduct]} />);
    
    // Add item to cart first
    fireEvent.click(screen.getByTestId('add-99'));

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    // Verify error messages for all mandatory fields are shown
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/credit card number is required/i)).toBeInTheDocument();
  });

  it('renders validation error for invalid email format', async () => {
    render(<CheckoutTestHarness initialProducts={[testProduct]} />);
    
    fireEvent.click(screen.getByTestId('add-99'));

    // Fill fields
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1234567812345678' } });

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it('triangulates email validation with various malformed email inputs', async () => {
    render(<CheckoutTestHarness initialProducts={[testProduct]} />);
    fireEvent.click(screen.getByTestId('add-99'));

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const addressInput = screen.getByLabelText(/shipping address/i);
    const cardInput = screen.getByLabelText(/credit card/i);
    const submitBtn = screen.getByRole('button', { name: /complete order/i });

    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      'email@example.com (Joe Smith)',
    ];

    for (const email of invalidEmails) {
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.change(addressInput, { target: { value: '456 Oak Ave' } });
      fireEvent.change(cardInput, { target: { value: '9876543210987654' } });

      fireEvent.click(submitBtn);
      
      expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    }
  });


  it('renders validation error for invalid credit card format (not 16 digits)', async () => {
    render(<CheckoutTestHarness initialProducts={[testProduct]} />);
    
    fireEvent.click(screen.getByTestId('add-99'));

    // Test with less than 16 digits
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1234567890' } });

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/credit card must be exactly 16 digits/i)).toBeInTheDocument();

    // Test with non-numeric characters
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '123456789012345a' } });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/credit card must be exactly 16 digits/i)).toBeInTheDocument();
  });

  it('successfully submits when form is valid, clearing the cart and showing success state', async () => {
    const handleSuccess = vi.fn();
    render(<CheckoutTestHarness initialProducts={[testProduct]} onCheckoutSuccess={handleSuccess} />);

    // Add item to cart
    fireEvent.click(screen.getByTestId('add-99'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items in Cart: 1');

    // Fill valid info
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '123 Main St, City' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1234567890123456' } });

    const submitBtn = screen.getByRole('button', { name: /complete order/i });
    fireEvent.click(submitBtn);

    // Wait for the modal or success state to display
    // Success confirmation modal should be visible
    expect(await screen.findByText(/order placement successful/i)).toBeInTheDocument();
    
    // Order ID should be displayed (regex matching simulated order ID)
    expect(screen.getByText(/order id:/i)).toBeInTheDocument();
    
    // The cart count must be cleared
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items in Cart: 0');

    // It should trigger onCheckoutSuccess callback
    expect(handleSuccess).toHaveBeenCalledTimes(1);

    // Let's check that we can close the modal, resetting the order confirmation state
    const closeBtn = screen.getByRole('button', { name: /close confirmation/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/order placement successful/i)).not.toBeInTheDocument();
  });
});
