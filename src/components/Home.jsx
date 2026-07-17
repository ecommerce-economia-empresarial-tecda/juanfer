import { useRef } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

export default function Home() {
  const { products } = useProducts();
  const { setView } = useAuth();
  const offersRef = useRef(null);

  const offerProducts = products.filter((p) => p.onSale === true);
  const newArrivals = products.filter((p) => p.isNew === true);

  const scrollToOffers = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content-glass">
            <h1 className="hero-title">Welcome to Antigravity Shop</h1>
            <p className="hero-tagline">
              Premium, high-performance gear built for the next frontier. Experience gravity-defying quality.
            </p>
            <div className="hero-actions">
              <button
                onClick={() => setView('catalog')}
                className="hero-btn shop-now-btn"
              >
                Shop Now
              </button>
              <button
                onClick={scrollToOffers}
                className="hero-btn view-offers-btn"
              >
                View Offers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offers / Promociones Section */}
      <section ref={offersRef} className="home-section offers-section" id="offers-section">
        <div className="section-header">
          <h2>Offers & Promociones</h2>
          <p>Grab them before they are gone! Special limited-time discounts.</p>
        </div>
        {offerProducts.length === 0 ? (
          <p className="no-products-message">No offers available right now.</p>
        ) : (
          <div className="products-grid">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals / Novedades Section */}
      <section className="home-section new-arrivals-section">
        <div className="section-header">
          <h2>New Arrivals & Novedades</h2>
          <p>Check out our latest premium equipment fresh in stock.</p>
        </div>
        {newArrivals.length === 0 ? (
          <p className="no-products-message">No new arrivals available right now.</p>
        ) : (
          <div className="products-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
