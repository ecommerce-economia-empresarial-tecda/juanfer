import { useContext } from 'react';
import { useCart } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';

export default function ProductDetailsModal({ product, onClose }) {
  const { cart, addToCart } = useCart();
  const notificationCtx = useContext(NotificationContext);
  const showNotification = notificationCtx ? notificationCtx.showNotification : () => {};

  if (!product) return null;

  const cartItem = cart.find((item) => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isSoldOut = product.stock === 0;
  const isStockExhausted = cartQuantity >= product.stock;
  const isAddDisabled = isSoldOut || isStockExhausted;

  const finalPrice = product.onSale
    ? Number((product.price * (1 - (product.discountPercent || 0) / 100)).toFixed(2))
    : product.price;

  const handleAddToCart = () => {
    if (!isAddDisabled) {
      addToCart({ ...product, price: finalPrice });
      showNotification(`Added ${product.title} to cart!`, 'success');
    }
  };

  return (
    <div
      className="modal-overlay"
      data-testid="product-details-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close details"
        >
          &times;
        </button>
        <div className="modal-body">
          <div className="modal-image-container">
            <img
              src={product.image}
              alt={product.title}
              className="modal-image"
              style={{ viewTransitionName: `product-img-${product.id}` }}
            />
          </div>
          <div className="modal-info">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-title">{product.title}</h2>
            <p className="modal-description">{product.description}</p>
            
            <div className="modal-pricing-stock">
              <div className="modal-price-container">
                {product.onSale ? (
                  <>
                    <span className="modal-price-original" style={{ textDecoration: 'line-through', marginRight: '8px', color: '#888' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="modal-price-discount" style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                      ${finalPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="modal-price">${product.price.toFixed(2)}</span>
                )}
              </div>
              <span className="modal-stock">Stock: {product.stock - cartQuantity}</span>
            </div>

            {isSoldOut && <span className="sold-out-badge">Sold Out</span>}

            <button
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className="modal-add-to-cart-btn"
              aria-label={isSoldOut ? 'Sold Out' : `Add to Cart ${product.title}`}
            >
              {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
