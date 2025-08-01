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
- **Command**: `npm run test:registration`

#### Test 2: Shopping Cart Flow  
- **Configuration**: 10 concurrent users, 5 iterations each
- **Flow**: Login → Browse catalog → View product → Add to cart → Logout
- **Executor**: `per-vu-iterations`
- **Command**: `npm run test:shopping`

### Final 2: Pizza Tests

#### Test 3: Create Pizza User
- **Configuration**: 5 concurrent users, 5 iterations each
- **Flow**: Create new users for pizza application
- **Executor**: `per-vu-iterations`
- **Command**: `npm run test:createUser`

#### Test 4: Rate Pizza
- **Configuration**: 10 concurrent users, 5 requests per second, 30 seconds duration
- **Flow**: Register user → Login → Rate pizza with random stars
- **Executor**: `constant-arrival-rate`
- **Command**: `npm run test:ratePizza`

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
# Run all Nopcommerce tests sequentially
npm run test:final1          # Test 1 + Test 2

# Run all Pizza tests sequentially
npm run test:final2          # Test 3 + Test 4

# Run all tests in sequence
npm run test:all             # All tests (final1 + final2)
```

## Test Configuration Details

### Test 1: User Registration
- **Ramp Up**: 0 → 5 users over 10 seconds
- **Load**: 5 users for 1 minute
- **Ramp Down**: 5 → 0 users over 10 seconds
- **Total Duration**: ~1 minute 20 seconds

### Test 2: Shopping Cart
- **Virtual Users**: 10 concurrent users
- **Iterations**: 5 iterations per user
- **Max Duration**: 2 minutes
- **Total Requests**: 50 requests (10 users × 5 iterations)

### Test 3: Create Pizza User
- **Virtual Users**: 5 concurrent users
- **Iterations**: 5 iterations per user
- **Max Duration**: 1 minute
- **Total Requests**: 25 requests (5 users × 5 iterations)

### Test 4: Rate Pizza
- **Virtual Users**: 10 concurrent users
- **Request Rate**: 5 requests per second
- **Duration**: 30 seconds
- **Total Requests**: 150 requests (5 req/s × 30s)

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
- **Scenario Selection**: Dynamic scenario loading based on environment variables

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

## Technical Implementation

- **Environment Variables**: Uses `--env SCENARIO=` to select specific test scenarios
- **Dynamic Configuration**: Each test uses its own configuration from `test-config.js`
- **Single Scenario Loading**: Only loads the selected scenario to avoid conflicts
- **Proper Error Handling**: Comprehensive checks and logging for each step
- **Realistic User Behavior**: Random sleep times and realistic user flows
