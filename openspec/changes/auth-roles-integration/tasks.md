# Tasks: Auth & RBAC Integration

## Review Workload Forecast
- Decision needed before apply: No
- Chained PRs recommended: Yes
- Chain strategy: feature-branch-chain
- 400-line budget risk: High

### Suggested Work Units
| Unit | Goal | Focus Test Command | Runtime Harness | Rollback Boundary |
|------|------|--------------------|-----------------|-------------------|
| 1 | Products Context | `npm run test -- ProductsContext.test` | Unit Tests | `src/context/ProductsContext.*` |
| 2 | Auth Context | `npm run test -- AuthContext.test` | Unit Tests | `src/context/AuthContext.*` |
| 3 | LoginForm Component | `npm run test -- LoginForm.test` | Component Tests | `src/components/LoginForm.*` |
| 4 | Admin Dashboard | `npm run test -- AdminDashboard.test` | Component Tests | `src/components/AdminDashboard.*` |
| 5 | Catalog integration | `npm run test -- ProductCatalog.test` | Component Tests | `src/components/ProductCatalog.*` |
| 6 | Checkout Validation | `npm run test -- CheckoutForm.test` | Component Tests | `src/components/CheckoutForm.*` |
| 7 | Routing & E2E | `npm run test` | App & E2E Integration | `src/App.jsx`, `src/App.css` |

## Phase 1: Foundation

### 1.1 Products Context
- [x] **RED**: Add tests in `src/context/ProductsContext.test.jsx` for `addProduct`, `updateProduct`, `deleteProduct`, and `decrementStock`.
  - *Test*: `npm run test -- ProductsContext.test`
- [x] **GREEN**: Implement `src/context/ProductsContext.jsx` using `localStorage` (key: `products_inventory`) and `mockData.js`.
- [x] **REFACTOR**: Optimize persistence and initial load logic.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/context/ProductsContext.*`

### 1.2 Auth Context
- [x] **RED**: Add tests in `src/context/AuthContext.test.jsx` checking login scenarios (success redirection, error validations, empty/invalid format errors), logout, and persistence.
  - *Test*: `npm run test -- AuthContext.test`
- [x] **GREEN**: Implement `src/context/AuthContext.jsx` with hardcoded emails (`admin@tecdron.com`, `customer@tecdron.com`) and `localStorage` session storage.
- [x] **REFACTOR**: Streamline auth error payload structure.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/context/AuthContext.*`

## Phase 2: Core Components

### 2.1 LoginForm Component
- [x] **RED**: Add tests in `src/components/LoginForm.test.jsx` checking inputs, email format regex, empty submission validations, and error UI display.
  - *Test*: `npm run test -- LoginForm.test`
- [x] **GREEN**: Implement `src/components/LoginForm.jsx` with state, form constraints, and integration with `AuthContext`.
- [x] **REFACTOR**: Align login input styling and error states.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/components/LoginForm.*`

### 2.2 AdminDashboard Component
- [x] **RED**: Add tests in `src/components/AdminDashboard.test.jsx` verifying layout, edit/delete actions, and product details form logic.
  - *Test*: `npm run test -- AdminDashboard.test`
- [x] **GREEN**: Create `src/components/AdminDashboard.jsx` using `ProductsContext` mutations.
- [x] **REFACTOR**: Clean up inline form handlers.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/components/AdminDashboard.*`

### 2.3 ProductCatalog Update
- [x] **RED**: Update `src/components/ProductCatalog.test.jsx` asserting list items fetch from `ProductsContext` and "Add to Cart" disabled when stock is 0.
  - *Test*: `npm run test -- ProductCatalog.test`
- [x] **GREEN**: Modify `src/components/ProductCatalog.jsx` to consume `useProducts()`.
- [x] **REFACTOR**: Simplify product mapping helper functions.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/components/ProductCatalog.*`

## Phase 3: Integration

### 3.1 Wiring, View State Routing & App
- [x] **RED**: Update `src/App.test.jsx` to assert login redirect on guest checkout, admin dashboard rendering exclusively, and context wrappers.
  - *Test*: `npm run test -- App.test`
- [x] **GREEN**: Wrap providers in `src/main.jsx` and modify `src/App.jsx` to switch views.
- [x] **REFACTOR**: Remove redundant props in root component.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/App.jsx src/main.jsx`

### 3.2 Checkout Verification
- [x] **RED**: Update `src/components/CheckoutForm.test.jsx` adding assertions for deleted items, insufficient stock warnings, and successful stock decrementing.
  - *Test*: `npm run test -- CheckoutForm.test`
- [x] **GREEN**: Modify `src/components/CheckoutForm.jsx` validating cart against `ProductsContext` before submission, then calling `decrementStock` and clearing cart.
- [x] **REFACTOR**: Extract checkout validator helpers.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/components/CheckoutForm.*`

### 3.3 Styling & E2E Integration Suite
- [x] **RED**: Create `src/App.integration.test.jsx` testing complete user/admin lifecycle flows.
  - *Test*: `npm run test -- App.integration.test`
- [x] **GREEN**: Add dashboard/login CSS styles to `src/App.css`.
- [x] **REFACTOR**: Remove unused CSS classes.
- *Harness*: RTL/Jest | *Rollback*: `git checkout src/App.css`
