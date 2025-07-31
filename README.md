# K6 Performance Test for Nopcommerce

This project contains K6 performance tests for Nopcommerce application.

## Test Scenarios

1. User Registration Test
   - Simulates 5 concurrent users registering new accounts
   - Ramps up over 10 seconds to 5 users
   - Runs for 1 minute
   - Ramps down over 10 seconds

2. Browse and Cart Test
   - Simulates 10 concurrent users browsing products and adding to cart
   - Each user performs 5 iterations
   - Starts after the registration scenario completes

## Prerequisites

1. Install K6: https://k6.io/docs/get-started/installation/
2. Make sure your Nopcommerce application is running locally

## Configuration

Update the `BASE_URL` in `test.js` to match your Nopcommerce installation URL.

## Running the Tests

```bash
k6 run test.js
```

## Test Results

The test will output metrics including:
- HTTP request statistics
- Virtual user metrics
- Scenario timing
- Check pass/fail rates
