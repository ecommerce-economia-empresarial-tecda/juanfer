# User Authentication Specification

## Purpose
Defines authentication, role-based access control, session persistence, and layouts for Guests, Customers, and Admins.

## Requirements

### Requirement: Authenticate Credentials
The system MUST validate user login credentials using hardcoded accounts: `admin@tecdron.com` for Admin and `customer@tecdron.com` for Customer.

#### Scenario: Successful customer login
- GIVEN a guest is on the login form
- WHEN they enter email "customer@tecdron.com" and password "password123" and submit
- THEN the system MUST authenticate the user as a Customer
- AND redirect the user to the "catalog" view.

#### Scenario: Successful admin login
- GIVEN a guest is on the login form
- WHEN they enter email "admin@tecdron.com" and password "password123" and submit
- THEN the system MUST authenticate the user as an Admin
- AND redirect the user to the "admin" view.

#### Scenario: Invalid login credentials
- GIVEN a guest is on the login form
- WHEN they enter email "unknown@tecdron.com" and password "password123" and submit
- THEN the system MUST display the validation error "Invalid email or password"
- AND block access.

#### Scenario: Empty fields validation
- GIVEN a guest is on the login form
- WHEN they submit with empty email or empty password
- THEN the system MUST display corresponding error messages "Email is required" or "Password is required"
- AND block submission.

#### Scenario: Invalid email format validation
- GIVEN a guest is on the login form
- WHEN they enter an invalid email format "invalid-email" and submit
- THEN the system MUST display the validation error "Invalid email format"
- AND block submission.

### Requirement: Role-Based Layout and Redirection
The system MUST enforce role-based access control. Guest can browse catalog and add to cart. Customer can checkout. Admin has exclusive access to the Admin Dashboard and MUST NOT access customer catalog or cart.

#### Scenario: Guest redirected to login on checkout
- GIVEN a guest user has items in their cart
- WHEN they click the "Checkout" button
- THEN the system MUST redirect them to the "login" view
- AND preserve their cart items.

#### Scenario: Customer login redirects to checkout if cart is not empty
- GIVEN a guest with items in their cart has been redirected to the login view
- WHEN they successfully log in as "customer@tecdron.com"
- THEN the system MUST redirect them to the "checkout" view
- AND restore their cart.

#### Scenario: Admin login redirects to dashboard
- GIVEN a guest is on the login form
- WHEN they log in as "admin@tecdron.com"
- THEN the system MUST redirect them to the "admin" view
- AND the system MUST NOT render the customer catalog or cart drawer.

### Requirement: Session Persistence
The system MUST persist the current authenticated user session (email, role, active view) in `localStorage` and restore it on initialization.

#### Scenario: Session restore on page reload
- GIVEN an active Customer session with email "customer@tecdron.com" on the "checkout" view
- WHEN the page is reloaded
- THEN the system MUST read `localStorage` and restore the user as a Customer
- AND keep them on the "checkout" view.
