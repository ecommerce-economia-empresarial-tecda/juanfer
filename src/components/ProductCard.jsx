import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isSoldOut = product.stock === 0;
  const isStockExhausted = cartQuantity >= product.stock;
  const isAddDisabled = isSoldOut || isStockExhausted;

  const handleAddToCart = () => {
    if (!isAddDisabled) {
      addToCart(product);
    }
  };

  return (
    <div className="product-card" data-testid={`product-card-${product.id}`}>
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price-stock">
          <span className="product-price">${product.price.toFixed(2)}</span>
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
