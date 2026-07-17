import { useState, useEffect, useRef } from 'react';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import ProductCatalog from './components/ProductCatalog';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import Home from './components/Home';
import ProductDetailsModal from './components/ProductDetailsModal';
import './App.css';

function MainApp() {
  const { cart } = useCart();
  const { user, currentView, setView, logout } = useAuth();
  const { notifications } = useNotification();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Track whether the user was redirected to login from a checkout attempt (ref avoids setState-in-effect)
  const pendingCheckout = useRef(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // After a customer logs in, redirect them to checkout if they came from cart
  useEffect(() => {
    if (pendingCheckout.current && user?.role === 'customer' && currentView !== 'login') {
      pendingCheckout.current = false;
      setView('checkout');
    }
  }, [user, currentView, setView]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      // Guest: redirect to login first
      pendingCheckout.current = true;
      setView('login');
    } else {
      setView('checkout');
    }
  };

  const handleSelectProduct = (product) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setSelectedProduct(product);
      });
    } else {
      setSelectedProduct(product);
    }
  };

  const handleCloseModal = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setSelectedProduct(null);
      });
    } else {
      setSelectedProduct(null);
    }
  };

  // Admin-exclusive view
  if (currentView === 'admin') {
    return (
      <>
        <AdminDashboard />
        <div className="toast-container">
          {notifications.map((n) => (
            <div key={n.id} className={`toast toast-${n.type}`}>
              {n.message}
            </div>
          ))}
        </div>
      </>
    );
  }

  // Catalog / Checkout / Login view
  return (
    <div className="app-layout">
      <header className="navbar">
        <div
          className="navbar-brand"
          onClick={() => setView('home')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setView('home');
            }
          }}
        >
          <h1>Antigravity Shop</h1>
        </div>
        <nav className="navbar-links">
          <button
            onClick={() => setView('home')}
            className={`nav-link-btn ${currentView === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setView('catalog')}
            className={`nav-link-btn ${currentView === 'catalog' ? 'active' : ''}`}
          >
            Shop
          </button>
          
          {user ? (
            <>
              <span className="user-indicator">
                Logged in as: <strong>{user.email}</strong>
              </span>
              <button
                onClick={logout}
                className="nav-link-btn logout-btn-nav"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('login')}
              className={`nav-link-btn ${currentView === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
          )}

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
        {currentView === 'home' && (
          <Home onProductClick={handleSelectProduct} />
        )}

        {currentView === 'catalog' && (
          <div className="catalog-view">
            <div className="view-header">
              <h2>Explore Our Collection</h2>
              <p>Premium, high-performance gear built for the next frontier.</p>
            </div>
            <ProductCatalog onProductClick={handleSelectProduct} />
          </div>
        )}

        {currentView === 'checkout' && (
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

        {currentView === 'login' && (
          <LoginForm />
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}

      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
