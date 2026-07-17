/**
 * Validates each cart item against the live product catalog.
 * Returns the first error message found, or null if all items are valid.
 *
 * @param {Array} cartItems - Items currently in the cart.
 * @param {Array} products  - Live product list from ProductsContext.
 * @returns {string|null}   - Error message string or null.
 */
export function validateCartStock(cartItems, products) {
  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return `El producto '${item.title}' ya no está disponible.`;
    }
    if (product.stock < item.quantity) {
      return `Solo hay ${product.stock} unidades disponibles de '${item.title}'.`;
    }
  }
  return null;
}
