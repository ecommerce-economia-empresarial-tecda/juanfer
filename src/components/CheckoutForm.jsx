import { useState, useContext } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import OrderConfirmationModal from './OrderConfirmationModal';
import { validateCartStock } from './checkoutStockValidator';
import { NotificationContext } from '../context/NotificationContext';


export default function CheckoutForm({ onCheckoutSuccess, onCloseConfirmation }) {
  const { cart, clearCart } = useCart();
  const { products, decrementStock } = useProducts();
  const notificationCtx = useContext(NotificationContext);
  const showNotification = notificationCtx ? notificationCtx.showNotification : () => {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    card: '',
  });
  const [errors, setErrors] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [stockError, setStockError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Mandatory Field Validation
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      // Email format validation (standard name@domain.com regex)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de correo electrónico no válido';
      }
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    if (!formData.card.trim()) {
      newErrors.card = 'El número de tarjeta de crédito es obligatorio';
    } else {
      // Credit card format validation (exactly 16 digits)
      const cardRegex = /^\d{16}$/;
      if (!cardRegex.test(formData.card)) {
        newErrors.card = 'La tarjeta de crédito debe tener exactamente 16 dígitos';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form can only be submitted if cart is not empty
    if (cart.length === 0) {
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Stock verification against live ProductsContext before placing the order
    const stockValidationError = validateCartStock(cart, products);
    if (stockValidationError) {
      setStockError(stockValidationError);
      return;
    }
    setStockError(null);

    // Decrement stock for each cart item in ProductsContext
    for (const item of cart) {
      decrementStock(item.id, item.quantity);
    }

    // Success flow
    const generatedOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    showNotification(`¡Pedido ${generatedOrderId} realizado con éxito!`, 'success');

    const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    if (!isTestEnv) {
      const { db } = await import('../firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      addDoc(collection(db, 'orders'), {
        orderId: generatedOrderId,
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        shippingAddress: formData.address.trim(),
        cartItems: cart.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, price: item.price })),
        createdAt: new Date().toISOString()
      }).catch(err => console.error("Error saving order:", err));
    }

    // Clear the cart
    clearCart();

    // Set the order ID to show modal
    setOrderId(generatedOrderId);

    // Clear form inputs
    setFormData({
      name: '',
      email: '',
      address: '',
      card: '',
    });
    setErrors({});

    // Trigger success callback
    if (onCheckoutSuccess) {
      onCheckoutSuccess(generatedOrderId);
    }
  };

  const handleCloseModal = () => {
    setOrderId(null);
    if (onCloseConfirmation) {
      onCloseConfirmation();
    }
  };

  return (
    <div className="checkout-form-container double-bezel-outer">
      <div className="double-bezel-inner" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} className="checkout-form" noValidate>
          <h2>Detalles del pago</h2>

          <div className="form-group">
            <label htmlFor="name-input" className="micro-eyebrow">Nombre completo</label>
            <input
              id="name-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email-input" className="micro-eyebrow">Correo electrónico</label>
            <input
              id="email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address-input" className="micro-eyebrow">Dirección de envío</label>
            <textarea
              id="address-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, Apt 4B"
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="card-input" className="micro-eyebrow">Tarjeta de crédito</label>
            <input
              id="card-input"
              type="text"
              name="card"
              value={formData.card}
              onChange={handleChange}
              placeholder="1234567890123456"
              maxLength={16}
              className={errors.card ? 'input-error' : ''}
            />
            {errors.card && <span className="error-message">{errors.card}</span>}
          </div>

          {stockError && (
            <p className="stock-error-message" role="alert">
              {stockError}
            </p>
          )}

          <button
            type="submit"
            disabled={cart.length === 0}
            className="submit-order-btn premium-btn-pill"
            aria-label="Completar pedido"
          >
            Completar pedido
          </button>
        </form>
      </div>

      <OrderConfirmationModal orderId={orderId} onClose={handleCloseModal} />
    </div>
  );
}
