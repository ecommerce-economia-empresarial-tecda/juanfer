# Shopping Cart Specification

## Purpose
Manages global cart state via React Context, limits quantities added based on stock availability, and persists state in localStorage.

## Requirements

### Requirement: Global Cart Context
The system MUST manage the cart state globally via React Context, providing methods to add, update, and remove items.

#### Scenario: Add item to cart
- GIVEN an empty cart and a product with stock of 10
- WHEN the product is added to the cart
- THEN the cart item count MUST increase by 1.

### Requirement: Enforce Stock Limits
The cart MUST NOT allow the quantity of any item to exceed its available stock.

#### Scenario: Add item exceeding stock
- GIVEN a product in the cart with quantity 5 (equal to stock limit of 5)
- WHEN the user attempts to increment the quantity in the cart
- THEN the quantity MUST remain 5 and the increment action MUST be disabled.

### Requirement: LocalStorage Persistence
The cart state MUST persist in localStorage and MUST restore automatically when the application loads.

#### Scenario: Reload page retains cart items
- GIVEN a cart containing 2 items of product A
- WHEN the page is reloaded
- THEN the cart state MUST load from localStorage showing 2 items of product A.

### Requirement: Total Price Calculation
The cart MUST dynamically calculate the total price of all items, applying modifications instantly.

#### Scenario: Remove item clears it and updates totals
- GIVEN a cart with product A ($10, qty 2) and product B ($20, qty 1)
- WHEN product A is removed
- THEN the cart total price MUST update to $20.
