import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import { ProductsProvider } from '../context/ProductsContext';
import CheckoutForm from './CheckoutForm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Harness to manage cart addition and wrap the CheckoutForm in CartProvider + ProductsProvider.
// `initialProducts` are added to both the cart buttons AND seeded into ProductsContext as the
// catalog, so stock validation in CheckoutForm passes for existing tests.
function CheckoutTestHarness({ initialProducts = [], onCheckoutSuccess = () => {} }) {
  // Seed localStorage so ProductsProvider initialises with the provided catalog
  if (initialProducts.length > 0) {
    window.localStorage.setItem('products_inventory', JSON.stringify(initialProducts));
  }
  return (
    <ProductsProvider>
      <CartProvider>
        <CartActionsAndCheckout initialProducts={initialProducts} onCheckoutSuccess={onCheckoutSuccess} />
      </CartProvider>
    </ProductsProvider>
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

/**
 * Stock-verification harness: wraps in both ProductsProvider and CartProvider.
 * `catalogProducts` seeds ProductsContext (simulates the live catalog).
 * `cartProducts` are added to cart via addToCart.
 */
function StockCheckHarness({ catalogProducts = [], cartProducts = [], onCheckoutSuccess = () => {} }) {
  // Seed localStorage so ProductsProvider initialises with controlled catalog
  window.localStorage.setItem('products_inventory', JSON.stringify(catalogProducts));
  return (
    <ProductsProvider>
      <CartProvider>
        <StockCheckInner cartProducts={cartProducts} onCheckoutSuccess={onCheckoutSuccess} />
      </CartProvider>
    </ProductsProvider>
  );
}

function StockCheckInner({ cartProducts, onCheckoutSuccess }) {
  const { cart, addToCart } = useCart();
  return (
    <div>
      {cartProducts.map(p => (
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

  // ─── 3.2 Stock-verification tests ────────────────────────────────────────────

  it('blocks order and shows error when a cart product has been deleted from catalog', async () => {
    // catalog has NO product 99 (simulates admin deleted it after user added to cart)
    const catalogProducts = [];
    const cartProduct = { id: 99, title: 'Checkout Product', price: 15, stock: 5 };

    render(
      <StockCheckHarness catalogProducts={catalogProducts} cartProducts={[cartProduct]} />
    );

    fireEvent.click(screen.getByTestId('add-99'));

    // Fill valid form data
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1234567890123456' } });

    fireEvent.click(screen.getByRole('button', { name: /complete order/i }));

    // Should display "no longer available" error for the deleted product
    expect(
      await screen.findByText(/product 'checkout product' is no longer available/i)
    ).toBeInTheDocument();

    // Order must NOT be placed
    expect(screen.queryByText(/order placement successful/i)).not.toBeInTheDocument();
  });

  it('blocks order and shows error when cart quantity exceeds available stock', async () => {
    // catalog has product 99 with only 2 in stock
    const catalogProducts = [
      { id: 99, title: 'Checkout Product', price: 15, stock: 2 },
    ];
    // cart product has stock: 5 so addToCart won't be blocked at cart level,
    // but catalog only has 2 → validation at checkout should catch mismatch.
    // We add 3 times (each click increments quantity by 1)
    const cartProduct = { id: 99, title: 'Checkout Product', price: 15, stock: 5 };

    render(
      <StockCheckHarness catalogProducts={catalogProducts} cartProducts={[cartProduct]} />
    );

    // Add 3 units to cart
    fireEvent.click(screen.getByTestId('add-99'));
    fireEvent.click(screen.getByTestId('add-99'));
    fireEvent.click(screen.getByTestId('add-99'));

    // Fill valid form data
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '1234567890123456' } });

    fireEvent.click(screen.getByRole('button', { name: /complete order/i }));

    // Should display "only N units available" error
    expect(
      await screen.findByText(/only 2 units of 'checkout product' are available/i)
    ).toBeInTheDocument();

    // Order must NOT be placed
    expect(screen.queryByText(/order placement successful/i)).not.toBeInTheDocument();
  });

  it('calls decrementStock for each cart item and clears cart on valid checkout', async () => {
    const catalogProducts = [
      { id: 99, title: 'Checkout Product', price: 15, stock: 10 },
    ];
    const cartProduct = { id: 99, title: 'Checkout Product', price: 15, stock: 10 };
    const handleSuccess = vi.fn();

    render(
      <StockCheckHarness
        catalogProducts={catalogProducts}
        cartProducts={[cartProduct]}
        onCheckoutSuccess={handleSuccess}
      />
    );

    // Add 2 units to cart
    fireEvent.click(screen.getByTestId('add-99'));
    fireEvent.click(screen.getByTestId('add-99'));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items in Cart: 1');

    // Fill valid form data
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/shipping address/i), { target: { value: '456 Oak Ave' } });
    fireEvent.change(screen.getByLabelText(/credit card/i), { target: { value: '9876543210987654' } });

    fireEvent.click(screen.getByRole('button', { name: /complete order/i }));

    // Order confirmation must appear
    expect(await screen.findByText(/order placement successful/i)).toBeInTheDocument();
    expect(screen.getByText(/order id:/i)).toBeInTheDocument();

    // Cart must be cleared
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Items in Cart: 0');

    // Callback must have been fired
    expect(handleSuccess).toHaveBeenCalledTimes(1);

    // localStorage inventory should reflect decremented stock (10 - 2 = 8)
    const stored = JSON.parse(window.localStorage.getItem('products_inventory'));
    expect(stored.find(p => p.id === 99).stock).toBe(8);
  });
});
