# Dominik-Coffee-Mug-Homework Notes

## Introduction

The test environment at [https://demo-magento-2.auroracreation.com/en/](https://demo-magento-2.auroracreation.com/en/) is a demo version of the Magento 2 Open Source platform provided by the Polish agency Aurora Creation. It features a clean setup with sample data, perfect for testing e-commerce functionalities without risking production systems. Data resets automatically every 6 hours (at 6:00, 12:00, 18:00, and 0:00 CET).

**Admin panel**: [https://demo-magento-2.auroracreation.com/admin_panel/](https://demo-magento-2.auroracreation.com/admin_panel/)  
**Credentials**: username `demo_admin`, password `demo_admin123` (the credentials were included here because they are publicly accessible from the frontend via the top navigation bar, and their inclusion does not impact security.)

The storefront simulates a fashion store with the Luma theme, offering product search, categories (e.g., Men > Tops > Jackets), product pages with configuration options, cart, checkout with payments and shipping, and customer account tabs for login/registration. It supports testing promotions, new products, and navigation.

## Tests Concept

Framework based on default Playwright test concept: [Playwright Fixtures](https://playwright.dev/docs/api/class-fixtures).

The test structure divides e2e tests into three main modules: **user**, **cart**, and **product**. This modular layout facilitates maintenance, debugging, and scaling of Playwright tests in TypeScript.

---

## User Module

Uses default user from `.env` file (the credentials were included in this file because they are publicly accessible and their inclusion does not impact security). Unique users for registration (deleted after 6h reset).

**Location**: `user/` subdirectory  
**Files**: `login.spec.ts`

#### 1. Test: `login passed`
**Description**: Verifies successful login with valid credentials.  
**Ensures**:
- Login page is accessible
- Valid credentials can be entered
- Welcome message displays after login

#### 2. Test: `login failed`
**Description**: Verifies behavior with invalid credentials.  
**Ensures**:
- Login page is accessible
- Invalid credentials entered
- Error message displayed

#### 3. Test: `refresh session`
**Description**: Verifies session persistence after page refresh.  
**Ensures**:
- Successful login
- Multiple page refreshes
- User remains logged in with welcome message

#### 4. Test: `logout`
**Description**: Verifies successful logout.  
**Ensures**:
- Successful login
- Logout option works
- Confirmation message shown
- Default welcome message restored

**Location**: `user/` subdirectory  
**Files**: `registration.spec.ts` 

#### 1. Test: `add new user`
**Description**: Verifies new account creation.  
**Ensures**:
- Navigation to "Create an Account" page
- All required fields filled (name, email, password)
- Account created with confirmation
- Welcome message with user name
- "My Account" shows user details

---

## Cart Module

**Location**: `cart/cart.spec.ts`  
**Focus**: Adding products, quantities, removal, discounts (uses "H20" demo code), various product types.

#### 1. Test: `add from details view`
**Description**: Add product from product details page.  
**Ensures**:
- Product searched and displayed
- Product added to cart
- Cart price matches product price

#### 2. Test: `add from list view`
**Description**: Add product from product list.  
**Ensures**:
- Product visible in list
- Product added to cart
- Cart price matches product price

#### 3. Test: `mutation`
**Description**: Various cart operations.  
**Ensures**:
- Add two different products
- Update quantity of one product
- Remove product from cart
- Prices update correctly

#### 4. Test: `discount`
**Description**: Apply valid discount code.  
**Ensures**:
- Product added to cart
- Discount code applied successfully
- Price reduced per discount percentage

#### 5. Test: `invalid discount`
**Description**: Handle invalid discount code.  
**Ensures**:
- Product added to cart
- Invalid code rejected
- Cart price unchanged

---

## Product Module

**Location**: `product/product.spec.ts`  
**Focus**: Catalog browsing, search, categories, filters, product details.

#### 1. Test: `by search box`
**Description**: Product search functionality.  
**Ensures**:
- Search term matches product name
- Correct number of results displayed

#### 2. Test: `by search box - no results`
**Description**: No matching products behavior.  
**Ensures**:
- "No results" message displayed

#### 3. Test: `by category and filters`
**Description**: Category navigation + filters.  
**Ensures**:
- Navigate to specific category
- Apply filters (price, color, material, size)
- Correct product displayed
- Product details page shows correct info

---

## Not Implemented

Playwright `auth.setup.ts` is not implemented becouse is works well in stable production environments with persistent storage, but here sessions are ephemeral, making global auth inefficient. Excluding the login test, most tests (`product/*`, `cart/*`) run without logging in, and the login process is simple—a standard form without authentication apps (OAuth, SAML, 2FA). It would also be necessary to create a separate project for `registration.spec.ts` that would not use the auth data.

## Benefits of Approach

- **Stability**: Tests survive data resets
- **Isolation**: No side-effects between modules
- **Debugging**: Easy failure tracing
- **Simplicity**: Basic `page.fill()` + `click()`
- **CI/CD**: Parallel execution without race conditions