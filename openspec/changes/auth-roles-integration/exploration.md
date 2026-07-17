## Exploration: Auth and Roles Integration

### Current State
- **Routing & Navigation**: Simple state-based view routing in [App.jsx](file:///home/jmro/Documents/juanfer/src/App.jsx) (options: `'catalog'` and `'checkout'`). No external routing library is used.
- **State Management**: [CartContext.jsx](file:///home/jmro/Documents/juanfer/src/context/CartContext.jsx) manages cart item quantities, additions, and local storage persistence.
- **Product Collection**: Stored in a static list in [mockData.js](file:///home/jmro/Documents/juanfer/src/mockData.js) and imported directly by [ProductCatalog.jsx](file:///home/jmro/Documents/juanfer/src/components/ProductCatalog.jsx), providing no dynamic updates (additions, edits, or stock changes) that persist across views or sessions.
- **Authentication**: No login views, credentials handling, or session states exist.

### Affected Areas
- **[App.jsx](file:///home/jmro/Documents/juanfer/src/App.jsx)**: Wrap with providers, update Navbar links/buttons dynamically based on auth state, and support new view modes (`'login'`, `'admin'`).
- **New Files**:
  - `src/context/AuthContext.jsx`: Manages current logged-in user, logins, logouts, and session persistence in `localStorage`. Hosts hardcoded accounts (`admin@tecdron.com` -> Admin, `customer@tecdron.com` -> Customer).
  - `src/context/ProductsContext.jsx`: Creates a dynamic global state for products initialized from `mockData.js`, supporting adding new products, modifying details, and updating stock levels.
  - `src/components/LoginForm.jsx`: Login page UI with form validation, error reporting, and submit handlers.
  - `src/components/AdminDashboard.jsx`: Control panel view visible only to admins to manage catalog details and add new products.
- **Testing**:
  - [App.test.jsx](file:///home/jmro/Documents/juanfer/src/App.test.jsx) and [App.integration.test.jsx](file:///home/jmro/Documents/juanfer/src/App.integration.test.jsx): Need updates to handle context providers (`AuthProvider` and `ProductsProvider`).
  - New unit/integration tests for authentication flows and admin dashboard functions.

### Approaches
#### Option 1: Route-Based Layout with `react-router-dom`
- **Description**: Add `react-router-dom` dependency to handle URLs and protect paths like `/admin` or `/login`.
- **Pros**: Matches industry-standard URL-based routing.
- **Cons**: High complexity, requires major refactoring of current test suites, and conflicts with existing state-based view switching.

#### Option 2: State-Based View Switching (Local SPA Router)
- **Description**: Extend the existing `view` state in `App.jsx` to include `'login'` and `'admin-dashboard'`. Render components conditionally based on authorization checks.
- **Pros**: Zero external routing dependencies, maintains existing code patterns, and minimal refactoring risk.
- **Cons**: No URL deep-linking (e.g., refreshing on admin page defaults back to home catalog unless session state is persisted).

### Recommendation
**Option 2: State-Based View Switching** is recommended. It perfectly fits the existing architectural pattern of the application, maintains high testability without introducing heavy dependencies, and fulfills all customer requirements with minimal complexity. In tandem, introducing `ProductsContext` is recommended to support dynamic, persistent updates for product listings and stock.

### Risks
- **Admin Actions Persistence**: In-memory changes to mock data (like adding products or editing details) will be lost on page reload unless stored in `localStorage`.
- **Security Limitation**: Client-side authorization can be bypassed/manipulated by modifying local storage variables, but is acceptable given this is a client-only demo app.
- **State Stale-ness**: If cart data is not checked against the new dynamic product stock, users might checkout items that were deleted or modified by an admin.

### Ready for Proposal
Yes
