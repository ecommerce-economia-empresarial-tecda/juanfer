# Product Catalog Specification Delta

## MODIFIED

### Requirement: Render Product Grid
The system MUST render a responsive product grid. Each product card MUST display title, description, price, category, image, and stock. If the authenticated user has the Admin role, the system MUST render the Admin Dashboard and hide the customer product catalog.

#### Scenario: Render product details
- GIVEN a list of products with title, price, and stock
- WHEN the catalog loads for a Guest or Customer
- THEN details for each product MUST be visible in the grid.

#### Scenario: Admin role views Admin Dashboard
- GIVEN a user is logged in as an Admin
- WHEN the catalog page is loaded
- THEN the Admin Dashboard MUST be displayed
- AND the customer product catalog grid MUST be hidden.

## ADDED

### Requirement: Admin Catalog Management
The system MUST allow Admins to manage the product catalog from the Admin Dashboard, supporting adding, editing, and deleting products in real-time.

#### Scenario: Admin adds a new product
- GIVEN an authenticated Admin is on the Admin Dashboard
- WHEN they fill out the product form with valid details and submit
- THEN the product MUST be added to the catalog in real-time.

#### Scenario: Admin updates product stock
- GIVEN an authenticated Admin is on the Admin Dashboard
- WHEN they update the stock of a product to a new level
- THEN the product's stock MUST be updated in real-time.

#### Scenario: Admin deletes a product
- GIVEN an authenticated Admin is on the Admin Dashboard
- WHEN they delete a product from the list
- THEN the product MUST be removed from the catalog in real-time.
