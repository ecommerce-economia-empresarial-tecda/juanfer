# Juanfer Shop - Premium E-Commerce Prototype

A modern, high-performance single-page e-commerce prototype built with **React**, **Vite**, and **Firebase (Cloud Firestore & Hosting)**. This application integrates client-side Authentication, Role-Based Access Control (RBAC), real-time stock management, and a dynamic toast notification system.

## 🌐 Live Demo
The application is deployed and hosted on Firebase Hosting:
👉 **[https://juanfer-shop-2026.web.app](https://juanfer-shop-2026.web.app)**

---

## 🛠️ Architecture & Tech Stack
- **Frontend Core**: React 19 + JavaScript (ES6+).
- **Build System & Dev Server**: Vite 8 for fast Hot Module Replacement (HMR).
- **Styling**: Vanilla CSS featuring a premium dark-mode responsive layout, glassmorphic elements, smooth micro-animations, and slide-in drawer transitions.
- **State Management**: React Context API for modular state control:
  - `AuthContext`: Manages active user sessions, view navigation, and authentication.
  - `ProductsContext`: Coordinates inventory levels and real-time database sync.
  - `CartContext`: Handles shopping cart additions, quantity calculations, and checkout states.
  - `NotificationContext`: Manages the queue of active floating toast notifications.
- **Backend & Database**: Firebase BaaS (Backend-as-a-Service):
  - **Cloud Firestore**: Real-time NoSQL database.
  - **Firebase Hosting**: Fast static asset deployment.
- **Test Runner**: Vitest + React Testing Library (RTL).

---

## 👤 User Personas & Access Roles (RBAC)

### 1. Guest / Unauthenticated User
- Can browse the product catalog and filter by category.
- Can add products to the shopping cart.
- Attempting to check out triggers a redirection to the **Sign In** view, preserving the active cart state. After logging in, the user is redirected to checkout.

### 2. Customer
- Access to browsing the catalog and managing the shopping cart.
- Can proceed to checkout.
- Checkout automatically validates the cart items and quantities against real-time stock levels in Firestore. Once validated, stock is decremented via a database transaction, and a new document is written to the `orders` collection.

### 3. Admin
- Logged-in admins are redirected immediately to the **Admin Dashboard**.
- Access is restricted exclusively to management views (cannot access the shopping cart or customer catalog).
- **Manage Products**:
  - Full CRUD capabilities for catalog items.
  - "Out of Stock" filter checkbox to quickly show items with 0 stock.
  - Highlighted row and red badges for out-of-stock items.
  - Quick **`+10 Stock`** button to restock any item in one click.
- **Manage Users**:
  - Full CRUD capabilities for user accounts (email, role).
  - Password Reset tool to blank credentials and assign new passwords.
  - Self-deletion protection (disabled deletion for the currently active admin session).

---

## 🗄️ Database Schema & Collections

Cloud Firestore stores data across three main collections:

### `products`
```json
{
  "id": 1,
  "title": "Wireless Headphones",
  "description": "High-quality noise-canceling wireless headphones.",
  "price": 99.99,
  "category": "Electronics",
  "image": "https://images.unsplash.com/...",
  "stock": 5
}
```

### `users`
```json
{
  "email": "customer@juanfershop.com",
  "password": "customerJFS2026!",
  "role": "customer"
}
```

### `orders`
```json
{
  "orderId": "ORD-1784283812064-7586",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "shippingAddress": "123 Space Blvd",
  "cartItems": [
    { "id": 1, "title": "Wireless Headphones", "quantity": 2, "price": 99.99 }
  ],
  "createdAt": "2026-07-17T10:23:32.064Z"
}
```

> [!NOTE]
> **Auto-Seeding**: If the `products` or `users` collections are empty upon application load, the system automatically initializes them with default mock data to ensure the demo is pre-populated.

---

## 🔑 Predefined Credentials
You can log in using these default credentials:

| Role | Email | Password |
|------|-------|----------|
| **Customer** | `customer@juanfershop.com` | `customerJFS2026!` |

> [!IMPORTANT]
> **Admin Credentials**: Admin accounts are provisioned securely on deployment and are not documented here to keep them private.

---

## ⚡ Setup & Development Instructions

### Prerequisites
- Node.js (v20 or higher recommended)
- Firebase CLI (for deployment)

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Launch the Vite development server. It connects directly to the real Cloud Firestore backend database:
```bash
npm run dev
```

### 3. Run Automated Tests
Vitest executes unit, component, and integration tests. 
```bash
npm run test
```
> [!TIP]
> **Test Fallback**: To ensure fast and deterministic execution without network overhead, the test runner automatically intercepts Firebase database calls and redirects them to a synchronous local storage/state fallback layer.

### 4. Build for Production
Compile and minify the assets into the `dist/` directory:
```bash
npm run build
```

### 5. Deployment
Deploy the local assets and Firestore configuration rules using the Firebase CLI:
```bash
npx firebase-tools deploy
```

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
