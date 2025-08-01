export const TEST_CONFIG = {
  // Test 1: User Registration (Nopcommerce)
  test1_registration: {
    baseUrl: 'http://localhost:5000',
    rampUpTime: '10s',
    loadTime: '1m',
    rampDownTime: '10s',
    maxUsers: 5
  },
  
  // Test 2: Shopping Cart (Nopcommerce) - 10 concurrent users, 5 iterations each
  test2_shopping: {
    baseUrl: 'http://localhost:5000',
    users: [
      { email: 'test.user1@example.com', password: 'Test@123' },
      { email: 'test.user2@example.com', password: 'Test@123' },
      { email: 'test.user3@example.com', password: 'Test@123' },
      { email: 'test.user4@example.com', password: 'Test@123' },
      { email: 'test.user5@example.com', password: 'Test@123' },
      { email: 'test.user6@example.com', password: 'Test@123' },
      { email: 'test.user7@example.com', password: 'Test@123' },
      { email: 'test.user8@example.com', password: 'Test@123' },
      { email: 'test.user9@example.com', password: 'Test@123' },
      { email: 'test.user10@example.com', password: 'Test@123' },
    ],
    virtualUsers: 10,
    iterationsPerUser: 5,
    maxDuration: '2m'
  },
  
  // Test 3: Create Pizza User
  test3_createUser: {
    baseUrl: 'https://quickpizza.grafana.com',
    virtualUsers: 5,          
    iterationsPerUser: 5,
    maxDuration: '1m'
  },
  
  // Test 4: Rate Pizza - 10 concurrent users, 5 req/s, 30 seconds
  test4_ratePizza: {
    baseUrl: 'https://quickpizza.grafana.com',
    virtualUsers: 10,
    requestRate: 5,
    duration: '30s'
  }
}; 