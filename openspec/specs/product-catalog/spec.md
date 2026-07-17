# Product Catalog Specification

## Purpose
Provides a responsive catalog UI to browse products by categories and displays details including title, price, and stock levels.

## Requirements

### Requirement: Render Product Grid
The system MUST render a responsive product grid. Each product card MUST display title, description, price, category, image, and stock.

#### Scenario: Render product details
- GIVEN a list of products with title, price, and stock
- WHEN the catalog loads
- THEN details for each product MUST be visible in the grid.

### Requirement: Filter by Category
The system SHOULD support filtering products by category using a dropdown or selector.

#### Scenario: Filter products by category
- GIVEN a catalog with products from "Electronics" and "Clothing"
- WHEN the category filter is set to "Electronics"
- THEN only "Electronics" products MUST be displayed.

### Requirement: Enforce Stock UI Indicator
The system MUST disable the Add to Cart button and display a "Sold Out" status if the product's stock is zero.

#### Scenario: No stock available
- GIVEN a product with stock equal to 0
- WHEN the product card is rendered
- THEN the Add to Cart button MUST be disabled with a "Sold Out" indicator.

#### Scenario: Stock exhausted in cart
- GIVEN a product with stock level of 5
- WHEN 5 items of that product are in the cart
- THEN the catalog Add to Cart button for that product MUST be disabled.
