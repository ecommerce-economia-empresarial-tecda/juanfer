# Shopping Cart Specification Delta

## MODIFIED

### CV-4 (Checkout Success and Cart Clearing)
Upon successful checkout validation, the system MUST display a success modal with a simulated order ID, decrement the purchased product stock levels in ProductsContext, and clear the cart.

#### Scenario: Successful order placement
- GIVEN the cart contains items
- AND the checkout form is valid
- WHEN submitted
- THEN a success modal with a simulated order ID MUST be displayed
- AND product stock levels MUST be decremented in ProductsContext
- AND the cart MUST be cleared.

## ADDED

### CV-5 (Real-time Stock Reconciliation)
The system MUST validate that every item in the cart exists in the product catalog and has sufficient stock immediately prior to final order submission.

#### Scenario: Checkout with deleted product
- GIVEN the cart contains a product that has been deleted by an admin
- WHEN the user submits the checkout form
- THEN the submission MUST be blocked
- AND an error message indicating the product no longer exists MUST be displayed.

#### Scenario: Checkout with insufficient stock
- GIVEN the cart contains a product with quantity 5
- AND the admin reduced the stock to 3
- WHEN the user submits the checkout form
- THEN the submission MUST be blocked
- AND an error message listing the insufficient stock and available quantity MUST be displayed.
