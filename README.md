# K6 Performance Tests

This project contains organized K6 performance tests for Nopcommerce and Pizza applications.

## Project Structure

```
├── utils/
│   ├── auth.js          # Authentication utilities (login, register, logout)
│   ├── shopping.js      # Shopping cart utilities (browse, view, add to cart)
│   └── pizza.js         # Pizza app utilities (user creation, rating)
├── config/
│   └── test-config.js   # Centralized test configuration
├── final-1-nopcommerce.js  # Final 1: Nopcommerce tests (registration + shopping)
├── final-2-pizza.js        # Final 2: Pizza app tests (user creation + rating)
└── package.json
```

## Test Scenarios

### Final 1: Nopcommerce Tests

#### Test 1: User Registration
- **Configuration**: 5 concurrent users, ramp up 10s, load 1 minute, ramp down 10s
- **Flow**: Register new user accounts with unique emails
- **Executor**: `ramping-vus`

#### Test 2: Shopping Cart Flow  
- **Configuration**: 10 concurrent users, 5 iterations each
- **Flow**: Login → Browse catalog → View product → Add to cart → Logout
- **Executor**: `per-vu-iterations`

### Final 2: Pizza Tests

#### Test 3: Create Pizza User
- **Configuration**: 5 concurrent users, 5 iterations each
- **Flow**: Create new users for pizza application
- **Executor**: `per-vu-iterations`

#### Test 4: Rate Pizza
- **Configuration**: 10 concurrent users, 5 requests per second, 30 seconds duration
- **Flow**: Register user → Login → Rate pizza with random stars
- **Executor**: `constant-arrival-rate`

## Running Tests

### Individual Tests
```bash
# Nopcommerce Tests
npm run test:registration    # Test 1: User registration (5 users, ramp up/down)
npm run test:shopping        # Test 2: Shopping cart (10 users, 5 iterations each)

# Pizza Tests
npm run test:createUser      # Test 3: Create pizza user (5 users, 5 iterations each)
npm run test:ratePizza       # Test 4: Rate pizza (10 users, 5 req/s, 30s)
```

### Combined Tests
```bash
# Run all Nopcommerce tests
npm run test:final1          # Test 1 + Test 2

# Run all Pizza tests  
npm run test:final2          # Test 3 + Test 4

# Run all tests
npm run test:all             # All tests in sequence
```

## Requirements

- **K6** installed on your system
- **Nopcommerce** running on http://localhost:5000
- **Pizza application** accessible at https://quickpizza.grafana.com

## Features

- **Modular Design**: Functions grouped by functionality for reusability
- **Clear Test Steps**: Each test function has descriptive names and proper logging
- **Proper Configuration**: Correct VU iterations and ramp-up/down flows
- **Error Handling**: Comprehensive checks and logging throughout
- **English Language**: Consistent English throughout the codebase
- **Centralized Config**: All test settings in `config/test-config.js`
- **Logout Integration**: Complete user journey with logout after shopping

## Test Flow Examples

### Shopping Cart Flow (Test 2)
1. **Login** with existing user credentials
2. **Browse** catalog page (notebooks)
3. **View** random product from available list
4. **Add to cart** with random quantity (1-3)
5. **Logout** to complete the session

### Pizza Rating Flow (Test 4)
1. **Register** new user with random credentials
2. **Login** to get authentication token
3. **Rate pizza** with random stars (1-5) and pizza ID (1-3)
4. **Complete** the rating process
