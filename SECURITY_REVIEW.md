# Security Audit & Review

This document outlines the security posture of the application across the Front-End, Back-End (Serverless Contexts), and Database (Cloud Firestore) layers, identifying risks and recommending mitigations for moving towards a production environment.

---

## 1. Front-End (React Application)

### Current Posture
- **View Guards**: State-based client routing in `App.jsx` prevents unauthorized view changes (e.g., guest accessing checkout or admin dashboard).
- **Session Persistence**: Sessions (email, role) are saved in `localStorage`.

### Vulnerabilities & Risks
- **Client-Side Authorization Bypass**: Client-side checks can be bypassed by modifying the React state or localStorage values in the browser DevTools (e.g., setting `auth_user` role to `'admin'`). While this grants access to the dashboard UI, it is not a leak *unless* the database permits unauthorized mutations.
- **XSS (Cross-Site Scripting)**: Unescaped inputs could theoretically run scripts. React automatically escapes strings rendered in JSX, mitigating most basic XSS.
- **Sensitive Storage**: `localStorage` is vulnerable to XSS. If a malicious script runs, it can read the stored session.

### Recommendations
- **Avoid Admin State Trust**: Never trust client-side roles for sensitive operations. Verify everything on the database/backend.
- **Transition to HTTPS**: Ensure HTTPS is enforced in production to protect transit tokens (handled automatically by Firebase Hosting).

---

## 2. Authentication & Credentials (Backend Context)

### Current Posture
- Custom credentials matching against a `users` collection in Firestore.

### Vulnerabilities & Risks
- **Plain-Text Passwords**: Passwords (e.g., `admin123`, `customer123`) are stored in plain text in the Firestore `users` collection. If an unauthorized read occurs, all user passwords are leaked.
- **Lack of Encryption/Hashing**: Authentication is handled by comparing plain strings.

### Recommendations
- **Migrate to Firebase Authentication SDK**:
  - Replace custom database checks with the official `firebase/auth` SDK.
  - Firebase Auth securely hashes and encrypts passwords, manages sessions using secure HTTP-only cookies/tokens, handles password resets safely, and integrates with Firestore security rules automatically.

---

## 3. Database (Cloud Firestore)

### Current Posture
- Firestore rules (`firestore.rules`) are currently set to open development mode:
  ```javascript
  allow read, write: if true;
  ```

### Vulnerabilities & Risks
- **Arbitrary Reads/Writes**: Anyone with the Firebase project config can read, modify, or delete any data (including clearing out the entire products inventory or reading other customers' shipping addresses and cards).

### Recommendations
1. **Enable Firebase Auth**: Linking database writes to `request.auth` allows locking down access:
   - Admins only for product modifications.
   - Owners only for reading orders.
2. **Apply Schema Validations**: Even without Firebase Auth, we can restrict operations with validation rules in `firestore.rules`.

Here is a hardened version of `firestore.rules` that introduces strict schema and field validations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products rules
    match /products/{productId} {
      allow read: if true; // Anyone can browse catalog
      allow write: if request.resource.data.title is string
                   && request.resource.data.price is number
                   && request.resource.data.price > 0
                   && request.resource.data.stock is int
                   && request.resource.data.stock >= 0;
    }
    
    // Users rules
    match /users/{email} {
      allow get: if true; // Needed for login query
      allow list: if true; // Needed for Admin Dashboard list (highly insecure without Auth)
      allow write: if request.resource.data.role in ['admin', 'customer']
                   && request.resource.data.password is string
                   && request.resource.data.password.size() >= 6;
    }
    
    // Orders rules
    match /orders/{orderId} {
      allow create: if request.resource.data.customerName is string
                    && request.resource.data.customerEmail is string
                    && request.resource.data.shippingAddress is string
                    && request.resource.data.cartItems is list;
      allow read: if true; // Allowed for demo, restrict in production to owners/admins
    }
  }
}
```

---

## Summary Roadmap for Production Security
1. **Implement Firebase Authentication** (replace plain-text database matching).
2. **Update Firestore Security Rules** to use `request.auth` (e.g., `allow write: if request.auth.token.role == 'admin'`).
3. **Remove Credit Card details** from database records or integrate with a secure payment gateway (like Stripe) rather than storing raw card numbers.
