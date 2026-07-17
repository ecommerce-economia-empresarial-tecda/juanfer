# E-commerce Bootstrap Specifications

This document defines the functional requirements and Gherkin-style test scenarios for the product-catalog, shopping-cart, and checkout-validation capabilities.

## Product Catalog Specification

### Purpose
Provides a responsive catalog UI to browse products by categories and displays details including title, price, and stock levels.

### Requirements
- **PC-1 (Render Product Grid)**: The system MUST render a responsive product grid. Each product card MUST display title, description, price, category, image, and stock.
  - **Scenario: Render product details**: GIVEN a list of products with title, price, and stock; WHEN the catalog loads; THEN details for each product MUST be visible.
- **PC-2 (Filter by Category)**: The system SHOULD support filtering products by category.
  - **Scenario: Filter products by category**: GIVEN a catalog with products from "Electronics" and "Clothing"; WHEN category filter is "Electronics"; THEN only "Electronics" products MUST be displayed.
- **PC-3 (Enforce Stock UI Indicator)**: The system MUST disable the Add to Cart button and display "Sold Out" if the product's stock is zero.
  - **Scenario: No stock available**: GIVEN a product with stock 0; WHEN the product card is rendered; THEN the Add to Cart button MUST be disabled with a "Sold Out" indicator.
  - **Scenario: Stock exhausted in cart**: GIVEN a product with stock 5; WHEN 5 items are in the cart; THEN the catalog Add to Cart button for that product MUST be disabled.

## Shopping Cart Specification

### Purpose
Manages global cart state via React Context, limits quantities added based on stock availability, and persists state in localStorage.

### Requirements
- **SC-1 (Global Cart Context)**: The system MUST manage the cart state globally via React Context, providing methods to add, update, and remove items.
  - **Scenario: Add item to cart**: GIVEN an empty cart and a product with stock of 10; WHEN the product is added; THEN the cart item count MUST increase by 1.
- **SC-2 (Enforce Stock Limits)**: The cart MUST NOT allow the quantity of any item to exceed its available stock.
  - **Scenario: Add item exceeding stock**: GIVEN a product in cart with quantity 5 (equal to stock limit); WHEN user increments quantity; THEN quantity MUST remain 5 and increment action MUST be disabled.
- **SC-3 (LocalStorage Persistence)**: The cart state MUST persist in localStorage and restore on load.
  - **Scenario: Reload page retains cart items**: GIVEN a cart with 2 items of product A; WHEN page reloads; THEN cart state MUST load from localStorage showing 2 items of product A.
- **SC-4 (Total Price Calculation)**: The cart MUST dynamically calculate the total price of all items.
  - **Scenario: Remove item clears it and updates totals**: GIVEN a cart with product A ($10, qty 2) and product B ($20, qty 1); WHEN product A is removed; THEN cart total price MUST update to $20.

## Checkout Validation Specification

### Purpose
Validates client-side checkout input fields, ensures constraints are satisfied, and simulates successful checkout.

### Requirements
- **CV-1 (Mandatory Field Validation)**: The checkout form MUST validate that Name, Email, Address, and Card fields are not empty.
  - **Scenario: Submit with empty fields**: GIVEN checkout form has one or more empty fields; WHEN submitted; THEN validation errors MUST be displayed and submission MUST be blocked.
- **CV-2 (Email Format Validation)**: The Email field MUST validate correct syntax using standard email rules (name@domain.com).
  - **Scenario: Invalid email format**: GIVEN Email contains "invalid-email"; WHEN submitted; THEN email validation error MUST be shown and submission MUST be blocked.
- **CV-3 (Credit Card Format Validation)**: The Credit Card field MUST validate that the input contains exactly 16 numeric digits.
  - **Scenario: Invalid card format**: GIVEN Card contains fewer than 16 digits or non-numeric characters; WHEN submitted; THEN card validation error MUST be shown and submission MUST be blocked.
- **CV-4 (Checkout Success and Cart Clearing)**: Upon successful checkout validation, the system MUST display a success modal with a simulated order ID and clear the cart.
  - **Scenario: Successful order placement**: GIVEN cart contains items and checkout form is valid; WHEN submitted; THEN success modal with order ID MUST be displayed AND cart MUST be cleared.
