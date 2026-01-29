# User Authentication System - Grazel Apparel

## Overview
The application now has a complete user authentication system where each user has their own separate account with isolated data (orders, cart, fit profile, etc.).

## Features

### 1. **User Login/Signup**
- Users must login or create an account before accessing the store
- Login page appears automatically if no user is logged in
- Form validation for password strength and email uniqueness

### 2. **Data Isolation Per User**
Each logged-in user sees:
- **Their own order history** (only their orders)
- **Their own cart** (cleared on logout)
- **Their own fit profile**
- **Their own account information**

Other users' data is completely hidden and inaccessible.

### 3. **User Account Information**
- User email is displayed in the header
- User name appears in navigation
- Quick logout button in user dropdown menu

## How to Use

### Demo Credentials
For testing, use these pre-created accounts:

**Account 1:**
- Email: `user@example.com`
- Password: `password123`

**Account 2:**
- Email: `john.smith@example.com`
- Password: `password123`

**Account 3:**
- Email: `emma.wilson@example.com`
- Password: `password123`

### Signup Process
1. Click "Sign Up" tab on the login page
2. Enter Full Name, Email, Password (min 6 characters)
3. Confirm Password
4. Click "Create Account"
5. New account is created and you are automatically logged in

### Login Process
1. Enter Email and Password
2. Click "Sign In"
3. You are logged in and see only your data

### Logout
1. Click your name in the top-right corner of the header
2. Click "Sign Out"
3. You are returned to the login page

## Technical Implementation

### Files Modified/Created

**New Files:**
- `src/app/components/user-auth.tsx` - Login/Signup UI component
- `src/app/components/user-authentication.tsx` - Authentication logic

**Modified Files:**
- `src/app/store/app-store.tsx` - Added user authentication functions
  - `loginUser(email, password)` - Authenticate existing user
  - `registerUser(name, email, password)` - Create new account
  - `logoutUser()` - Logout and clear user data

- `src/app/App.tsx` - Added user auth check
  - Shows login page if no user is logged in
  - Passes logout handler to header

- `src/app/components/header.tsx` - Added user menu
  - Shows current user's first name
  - Displays user dropdown menu
  - Logout button with icon

### Data Structure

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  joinedDate: string;
  address?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
}
```

### State Management
- `currentUser` - Currently logged-in user (null if logged out)
- `users` array - All registered users
- `orders` array - All orders (filtered by `currentUser.id` in components)
- `cartItems` - Current user's cart (cleared on logout)

### Key Functions

#### loginUser
```typescript
loginUser(email: string, password: string): boolean
```
- Authenticates user against stored credentials
- Sets `currentUser` if successful
- Returns true on success, false on failure

#### registerUser
```typescript
registerUser(name: string, email: string, password: string): boolean
```
- Creates new user account
- Prevents duplicate emails
- Validates password length (min 6 chars)
- Automatically logs in new user
- Returns true on success, false if email already exists

#### logoutUser
```typescript
logoutUser(): void
```
- Clears `currentUser`
- Clears cart items
- Resets admin status
- Returns user to login page

## Order History Example

**User 1 (john@example.com)**
- Order ORD-001
- Order ORD-004

**User 2 (emma@example.com)**
- Order ORD-002

**User 5 (james@example.com)**
- Order ORD-005

When User 1 logs in, they only see ORD-001 and ORD-004 in their history.

## Fit Profile Isolation

Each user can save their own fit profile with measurements:
- Height, Weight
- Chest, Waist, Hips
- Preferred Fit (Slim/Regular/Relaxed)

When a user logs in, only their fit profile is accessible.

## Admin Access
- Admin login is completely separate from user accounts
- Admin can still be accessed via `#/admin` URL
- Admin cannot access user accounts directly from the dashboard
- Admin can manage all products, users, orders via the admin panel

## Security Notes

⚠️ **This is a demo implementation.** For production:
- Never store passwords in plain text
- Use bcrypt or similar for password hashing
- Implement proper JWT tokens
- Use secure HTTP-only cookies
- Add password reset functionality
- Implement email verification
- Add rate limiting for login attempts
- Use HTTPS only

## Testing Scenario

1. **Log in as User 1** (`user@example.com`)
   - See their orders and cart

2. **Add items to cart** and place an order
   - Order appears only for User 1

3. **Log out** (Click name → Sign Out)

4. **Log in as User 2** (`john.smith@example.com`)
   - See different orders
   - Cart is empty (User 1's cart cleared on logout)
   - Cannot see User 1's data

5. **Create a new account**
   - Fill in signup form
   - New account created with empty order history
   - Can add items and place orders

## Files Structure

```
src/app/
├── components/
│   ├── user-auth.tsx          (NEW)
│   ├── header.tsx             (UPDATED)
│   ├── cart-checkout.tsx       (uses currentUser via store)
│   ├── product-listing.tsx     (uses currentUser via store)
│   └── ...
├── store/
│   └── app-store.tsx          (UPDATED with auth functions)
└── App.tsx                    (UPDATED with auth check)
```

---

**Created:** January 27, 2026
**Version:** 1.0
