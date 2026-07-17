export default function OrderConfirmationModal({ orderId, onClose }) {
  if (!orderId) return null;

  return (
    <div className="modal-overlay" data-testid="order-confirmation-modal">
      <div className="modal-content">
        <h2>¡Pedido realizado con éxito!</h2>
        <p className="order-success-msg">Gracias por su compra. Su pedido ha sido procesado con éxito.</p>
        <p className="order-id-display">
          <strong>ID del pedido:</strong> {orderId}
        </p>
        <button
          onClick={onClose}
          aria-label="Cerrar confirmación"
          className="close-modal-btn"
        >
          Cerrar confirmación
        </button>
      </div>
    </div>
  );
}
