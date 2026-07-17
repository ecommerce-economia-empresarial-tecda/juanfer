# Tasks: E-commerce Bootstrap

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900 - 1100 lines |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Context) → PR 2 (Catalog) → PR 3 (Cart/Checkout) → PR 4 (Integration) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Global cart context | PR 1 | `npm run test -- CartContext.test` | N/A - Context verification only | `src/context/CartContext.*`, `src/mockData.js` |
| 2 | Product catalog UI | PR 2 | `npm run test -- ProductCatalog.test` | N/A - Component testing | `src/components/ProductCatalog.*`, `src/components/ProductCard.*` |
| 3 | Cart drawer & Form | PR 3 | `npm run test -- CheckoutForm.test` | N/A - Component validations | `src/components/CartDrawer.*`, `src/components/CheckoutForm.*` |
| 4 | Wiring & CSS | PR 4 | `npm run test` | `npm run dev` | `src/App.jsx`, `src/App.css` |

## Phase 1: Foundation

- [x] 1.1 RED: Write `src/context/CartContext.test.jsx` verifying items adding, stock limits, total prices, and local storage persistence.
- [x] 1.2 GREEN: Create product mock data in `src/mockData.js`.
- [x] 1.3 GREEN: Implement `src/context/CartContext.jsx` with `CartProvider` and state handlers.
- [x] 1.4 REFACTOR: Verify unit tests pass and optimize storage serialization.

## Phase 2: Core Components

- [x] 2.1 RED: Write `src/components/ProductCatalog.test.jsx` verifying catalog rendering, category filtering, and "Sold Out" state.
- [x] 2.2 GREEN: Create `src/components/ProductCard.jsx` displaying details, image, and sold out indicator.
- [x] 2.3 GREEN: Create `src/components/ProductCatalog.jsx` with category dropdown and responsive grid structure.
- [x] 2.4 RED: Write validation checks in `src/components/CheckoutForm.test.jsx` verifying form empty fields, regex email, card format, and clear cart.
- [x] 2.5 GREEN: Create `src/components/CartDrawer.jsx` showing details, totals, and quantity controls.
- [x] 2.6 GREEN: Create `src/components/CheckoutForm.jsx` validating standard input parameters.
- [x] 2.7 GREEN: Create `src/components/OrderConfirmationModal.jsx` displaying generated order success ID.
- [x] 2.8 REFACTOR: Clean up layout constraints and confirm all component unit tests pass.

## Phase 3: Integration and Layout

- [x] 3.1 RED: Write `src/App.test.jsx` checking drawer toggling and catalog/checkout view state switching.
- [x] 3.2 GREEN: Update `src/App.jsx` mounting `CartProvider` and handling global drawer and routing state.
- [x] 3.3 GREEN: Modify `src/App.css` with layout variables, transitions, responsive grid, and form validation styles.
- [x] 3.4 REFACTOR: Remove obsolete standard styling templates from `src/App.css`.

## Phase 4: Verification

- [x] 4.1 RED: Write `src/App.integration.test.jsx` verifying complete checkout flow from add-to-cart to order ID display.
- [x] 4.2 GREEN: Run all tests to verify integration and fix any failing test logic.
- [x] 4.3 REFACTOR: Run `npm run lint` and `npm run build` checking for production build errors.
