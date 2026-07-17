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
      return `Product '${item.title}' is no longer available.`;
    }
    if (product.stock < item.quantity) {
      return `Only ${product.stock} units of '${item.title}' are available.`;
    }
  }
  return null;
}
