import { useContext } from 'react';
import { useCart } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';

export default function ProductCard({ product, onCardClick }) {
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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAddDisabled) {
      addToCart({ ...product, price: finalPrice });
      showNotification(`¡${product.title} agregado al carrito!`, 'success');
    }
  };

  return (
    <div
      className="product-card double-bezel-outer"
      data-testid={`product-card-${product.id}`}
      onClick={() => onCardClick && onCardClick(product)}
      style={{ cursor: 'pointer' }}
    >
      <div className="double-bezel-inner">
        <div className="product-image-container" style={{ position: 'relative', height: '220px', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="product-image"
              style={{ viewTransitionName: `product-img-${product.id}`, height: '100%', width: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                const placeholder = e.target.parentElement.querySelector('.product-image-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="product-image-placeholder" 
            style={{ 
              display: product.image ? 'none' : 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              width: '100%', 
              color: '#888', 
              fontSize: '14px',
              fontStyle: 'italic',
              background: 'rgba(0, 0, 0, 0.1)'
            }}
          >
            Sin imagen
          </div>
          <div className="product-badges">
            {product.onSale && <span className="badge badge-sale">OFERTA</span>}
            {product.isNew && <span className="badge badge-new">NUEVO</span>}
          </div>
        </div>
        <div className="product-info">
          <span className="product-category micro-eyebrow">{product.category}</span>
          <h3 className="product-title">{product.title}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-price-stock">
            <div className="product-price-container">
              {product.onSale ? (
                <>
                  <span className="product-price-original" style={{ textDecoration: 'line-through', marginRight: '8px', color: '#888' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="product-price-discount" style={{ color: '#f87171', fontWeight: 'bold' }}>
                    ${finalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="product-price">${product.price.toFixed(2)}</span>
              )}
            </div>
            <span className="product-stock">Stock: {product.stock - cartQuantity}</span>
          </div>
          
          {isSoldOut && <span className="sold-out-badge">Agotado</span>}
          
          <button
            onClick={handleAddToCart}
            disabled={isAddDisabled}
            aria-label={isSoldOut ? 'Agotado' : `Agregar ${product.title} al carrito`}
            className="add-to-cart-btn premium-btn-pill"
          >
            {isSoldOut ? 'Agotado' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
