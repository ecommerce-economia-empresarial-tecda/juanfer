import { useContext } from 'react';
import { useCart } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const notificationCtx = useContext(NotificationContext);
  const showNotification = notificationCtx ? notificationCtx.showNotification : () => {};

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
    <div className="product-card" data-testid={`product-card-${product.id}`}>
      <div className="product-image-container" style={{ position: 'relative' }}>
        <img src={product.image} alt={product.title} className="product-image" />
        <div className="product-badges">
          {product.onSale && <span className="badge badge-sale">SALE</span>}
          {product.isNew && <span className="badge badge-new">NEW</span>}
        </div>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price-stock">
          <div className="product-price-container">
            {product.onSale ? (
              <>
                <span className="product-price-original" style={{ textDecoration: 'line-through', marginRight: '8px', color: '#888' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span className="product-price-discount" style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                  ${finalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="product-price">${product.price.toFixed(2)}</span>
            )}
          </div>
          <span className="product-stock">Stock: {product.stock - cartQuantity}</span>
        </div>
        
        {isSoldOut && <span className="sold-out-badge">Sold Out</span>}
        
        <button
          onClick={handleAddToCart}
          disabled={isAddDisabled}
          aria-label={isSoldOut ? 'Sold Out' : `Add to Cart ${product.title}`}
          className="add-to-cart-btn"
        >
          {isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
