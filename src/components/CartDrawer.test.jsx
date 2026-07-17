import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { describe, it, expect, beforeEach, vi } from 'vitest';


// Alternatively, we can mock useCart, or we can use the actual CartProvider and simulate clicking "Add to Cart" on a catalog, or define a wrapper that runs context functions.
// Let's use actual CartProvider and render a test harness that adds items first, then renders the drawer.
function DrawerTestHarness({ initialProducts = [], isOpen = true, onClose = () => {}, onCheckout = () => {} }) {
  return (
    <CartProvider>
      <CartActionsAndDrawer initialProducts={initialProducts} isOpen={isOpen} onClose={onClose} onCheckout={onCheckout} />
    </CartProvider>
  );
}

function CartActionsAndDrawer({ initialProducts, isOpen, onClose, onCheckout }) {
  const { addToCart } = useCart();
  
  // Render buttons to easily add items to cart for test setup
  return (
    <div>
      {initialProducts.map(p => (
        <button key={p.id} onClick={() => addToCart(p)} data-testid={`add-${p.id}`}>
          Add {p.title}
        </button>
      ))}
      <CartDrawer isOpen={isOpen} onClose={onClose} onCheckout={onCheckout} />
    </div>
  );
}

describe('CartDrawer Component', () => {
  const testProducts = [
    {
      id: 1,
      title: 'Product A',
      description: 'Desc A',
      price: 10.00,
      category: 'Cat A',
      image: 'imgA.jpg',
      stock: 5
    },
    {
      id: 2,
      title: 'Product B',
      description: 'Desc B',
      price: 20.00,
      category: 'Cat B',
      image: 'imgB.jpg',
      stock: 3
    }
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DrawerTestHarness initialProducts={testProducts} isOpen={false} />
    );
    // Since drawer is closed, its content should not be in document or should be hidden
    // Let's assert it is not rendering the drawer container
    expect(container.querySelector('.cart-drawer')).not.toBeInTheDocument();
  });

  it('renders empty state when there are no items in the cart', () => {
    render(<DrawerTestHarness initialProducts={[]} isOpen={true} />);
    
    expect(screen.getByText(/su carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders cart items, quantity controls, and total price', () => {
    render(<DrawerTestHarness initialProducts={testProducts} isOpen={true} />);
    
    // Add items using setup buttons
    fireEvent.click(screen.getByTestId('add-1')); // Add Product A (qty 1)
    fireEvent.click(screen.getByTestId('add-1')); // Add Product A (qty 2)
    fireEvent.click(screen.getByTestId('add-2')); // Add Product B (qty 1)
    
    // Verify items rendering
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    
    // Verify details: price and quantities
    // Product A: qty 2, price 10.00. Total for Product A: $20.00
    // Product B: qty 1, price 20.00. Total for Product B: $20.00
    // Total price overall: $40.00
    expect(screen.getByText('$40.00')).toBeInTheDocument();
    
    // Check quantity values displayed
    const qtyInputsOrElements = screen.getAllByTestId(/quantity-display-/);
    expect(qtyInputsOrElements).toHaveLength(2);
    
    // We should be able to see the specific quantity
    const qtyA = screen.getByTestId('quantity-display-1');
    const qtyB = screen.getByTestId('quantity-display-2');
    expect(qtyA).toHaveTextContent('2');
    expect(qtyB).toHaveTextContent('1');
  });

  it('allows incrementing and decrementing item quantities within stock limits', () => {
    const { container } = render(<DrawerTestHarness initialProducts={testProducts} isOpen={true} />);
    
    // Add Product B (stock: 3)
    fireEvent.click(screen.getByTestId('add-2')); // qty 1
    
    const qtyB = screen.getByTestId('quantity-display-2');
    expect(qtyB).toHaveTextContent('1');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$20.00');

    const btnIncrement = screen.getByRole('button', { name: /aumentar cantidad de product b/i });
    const btnDecrement = screen.getByRole('button', { name: /disminuir cantidad de product b/i });

    // Increment to 2
    fireEvent.click(btnIncrement);
    expect(qtyB).toHaveTextContent('2');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$40.00');

    // Increment to 3 (stock limit)
    fireEvent.click(btnIncrement);
    expect(qtyB).toHaveTextContent('3');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$60.00');

    // Try to increment beyond stock limit (3)
    fireEvent.click(btnIncrement);
    expect(qtyB).toHaveTextContent('3'); // Remains 3
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$60.00');

    // Decrement to 2
    fireEvent.click(btnDecrement);
    expect(qtyB).toHaveTextContent('2');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$40.00');

    // Decrement to 1
    fireEvent.click(btnDecrement);
    expect(qtyB).toHaveTextContent('1');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$20.00');

    // Decrement below 1 should be blocked (minimum 1)
    fireEvent.click(btnDecrement);
    expect(qtyB).toHaveTextContent('1');
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$20.00');
  });

  it('allows removing items from the cart', () => {
    const { container } = render(<DrawerTestHarness initialProducts={testProducts} isOpen={true} />);
    
    fireEvent.click(screen.getByTestId('add-1'));
    fireEvent.click(screen.getByTestId('add-2'));

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$30.00');

    const btnRemoveA = screen.getByRole('button', { name: /eliminar product a/i });
    fireEvent.click(btnRemoveA);

    expect(screen.queryByText('Product A')).not.toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(container.querySelector('.cart-total-price')).toHaveTextContent('$20.00');

  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DrawerTestHarness initialProducts={testProducts} isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar carrito/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers checkout callback when checkout button is clicked', () => {
    const handleCheckout = vi.fn();
    render(<DrawerTestHarness initialProducts={testProducts} isOpen={true} onCheckout={handleCheckout} />);

    // Add an item so checkout isn't disabled
    fireEvent.click(screen.getByTestId('add-1'));

    const checkoutBtn = screen.getByRole('button', { name: /proceder al pago/i });
    fireEvent.click(checkoutBtn);
    expect(handleCheckout).toHaveBeenCalledTimes(1);
  });
});
