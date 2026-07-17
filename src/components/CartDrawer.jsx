import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="cart-drawer" data-testid="cart-drawer">
      <div className="drawer-header">
        <h2>Your Cart</h2>
        <button
          onClick={onClose}
          aria-label="Close Cart"
          className="close-drawer-btn"
        >
          &times;
        </button>
      </div>

      <div className="drawer-body">
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty</p>
        ) : (
          <ul className="cart-items-list">
            {cart.map((item) => (
              <li key={item.id} className="cart-item" data-testid={`cart-item-${item.id}`}>
                <img src={item.image} alt={item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.title}</h4>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  
                  <div className="cart-item-quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="qty-btn qty-dec"
                    >
                      -
                    </button>
                    <span
                      data-testid={`quantity-display-${item.id}`}
                      className="qty-display"
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="qty-btn qty-inc"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="remove-item-btn"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="drawer-footer">
        <div className="cart-total-row">
          <span>Total:</span>
          <span className="cart-total-price">${cartTotal.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          aria-label="Proceed to Checkout"
          className="checkout-btn"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
