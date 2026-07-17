import { useRef, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

export default function Home({ onProductClick }) {
  const { products } = useProducts();
  const { setView } = useAuth();
  const offersRef = useRef(null);
  const carouselRef = useRef(null);

  const offerProducts = products.filter((p) => p.onSale === true);
  const newArrivals = products.filter((p) => p.isNew === true);

  useEffect(() => {
    if (offerProducts.length <= 1) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [offerProducts]);

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-reveal');

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '0px 0px -20px 0px',
        threshold: 0.01 
      }
    );

    elements.forEach((el) => observer.observe(el));

    // Fallback safety timer: reveal after 1 second if observer didn't trigger
    const timer = setTimeout(() => {
      elements.forEach((el) => el.classList.add('revealed'));
    }, 1000);

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      clearTimeout(timer);
    };
  }, [products]);

  const scrollToOffers = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">

      {/* Offers / Promociones Section */}
      <section ref={offersRef} className="home-section offers-section scroll-reveal" id="offers-section">
        <div className="section-header">
          <h2>Offers & Promociones</h2>
          <p>Grab them before they are gone! Special limited-time discounts.</p>
        </div>
        {offerProducts.length === 0 ? (
          <p className="no-products-message">No offers available right now.</p>
        ) : (
          <div className="carousel-wrapper">
            <button
              className="carousel-btn prev-btn"
              onClick={scrollLeft}
              aria-label="Previous Offer"
            >
              &larr;
            </button>
            <div className="carousel-track" ref={carouselRef}>
              {offerProducts.map((product) => (
                <div className="carousel-item" key={product.id}>
                  <ProductCard product={product} onCardClick={onProductClick} />
                </div>
              ))}
            </div>
            <button
              className="carousel-btn next-btn"
              onClick={scrollRight}
              aria-label="Next Offer"
            >
              &rarr;
            </button>
          </div>
        )}
      </section>

      {/* New Arrivals / Novedades Section */}
      <section className="home-section new-arrivals-section scroll-reveal">
        <div className="section-header">
          <h2>New Arrivals & Novedades</h2>
          <p>Check out our latest premium equipment fresh in stock.</p>
        </div>
        {newArrivals.length === 0 ? (
          <p className="no-products-message">No new arrivals available right now.</p>
        ) : (
          <div className="products-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onCardClick={onProductClick} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
