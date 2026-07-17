export default function OrderConfirmationModal({ orderId, onClose }) {
  if (!orderId) return null;

  return (
    <div className="modal-overlay" data-testid="order-confirmation-modal">
      <div className="modal-content">
        <h2>Order Placement Successful!</h2>
        <p className="order-success-msg">Thank you for your purchase. Your order has been placed successfully.</p>
        <p className="order-id-display">
          <strong>Order ID:</strong> {orderId}
        </p>
        <button
          onClick={onClose}
          aria-label="Close Confirmation"
          className="close-modal-btn"
        >
          Close Confirmation
        </button>
      </div>
    </div>
  );
}
