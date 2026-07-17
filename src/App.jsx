import { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import ProductCatalog from './components/ProductCatalog';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import './App.css';

function MainApp() {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState('catalog'); // 'catalog' | 'checkout'

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-layout">
      <header className="navbar">
        <div 
          className="navbar-brand" 
          onClick={() => setView('catalog')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setView('catalog');
            }
          }}
        >
          <h1>Antigravity Shop</h1>
        </div>
        <nav className="navbar-links">
          <button 
            onClick={() => setView('catalog')} 
            className={`nav-link-btn ${view === 'catalog' ? 'active' : ''}`}
          >
            Shop
          </button>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="cart-toggle-btn"
            aria-label="Open Cart"
          >
            Cart <span className="cart-count-badge">{totalItems}</span>
          </button>
        </nav>
      </header>

      <main className="main-content">
        {view === 'catalog' ? (
          <div className="catalog-view">
            <div className="view-header">
              <h2>Explore Our Collection</h2>
              <p>Premium, high-performance gear built for the next frontier.</p>
            </div>
            <ProductCatalog />
          </div>
        ) : (
          <div className="checkout-view-container">
            <div className="checkout-navigation">
              <button 
                onClick={() => setView('catalog')} 
                className="back-to-shop-btn"
                aria-label="Back to Shop"
              >
                &larr; Back to Shop
              </button>
            </div>
            <CheckoutForm 
              onCheckoutSuccess={(orderId) => {
                console.log('Order completed:', orderId);
              }}
              onCloseConfirmation={() => {
                setView('catalog');
              }}
            />
          </div>
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }} 
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
