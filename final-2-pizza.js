import { sleep } from 'k6';
import { createUser, registerPizzaUser, loginPizzaUser, ratePizza, generateRandomRating } from './utils/pizza.js';
import { TEST_CONFIG } from './config/test-config.js';

// Get scenario from environment variable
const scenario = __ENV.SCENARIO || 'create_user_test';

// Only load the selected scenario
const scenarios = {};
scenarios[scenario] = scenario === 'create_user_test' ? {
  executor: 'per-vu-iterations',
  vus: TEST_CONFIG.test3_createUser.virtualUsers,
  iterations: TEST_CONFIG.test3_createUser.iterationsPerUser,
  maxDuration: TEST_CONFIG.test3_createUser.maxDuration,
} : {
  executor: 'constant-arrival-rate',
  rate: TEST_CONFIG.test4_ratePizza.requestRate,
  timeUnit: '1s',
  duration: TEST_CONFIG.test4_ratePizza.duration,
  preAllocatedVUs: TEST_CONFIG.test4_ratePizza.virtualUsers,
  maxVUs: TEST_CONFIG.test4_ratePizza.virtualUsers,
};

export const options = {
  scenarios: scenarios
};

export default function () {
  // Test 3: Create Pizza User
  function testCreatePizzaUser() {
    const baseUrl = TEST_CONFIG.test3_createUser.baseUrl;
    
    console.log(`VU ${__VU} [${__ITER}]: Starting pizza user creation test`);
    
    const user = createUser();
    const result = registerPizzaUser(baseUrl, user);
    
    if (result.success) {
      console.log(`VU ${__VU} [${__ITER}]: Pizza user created successfully`);
    } else {
      console.log(`VU ${__VU} [${__ITER}]: Pizza user creation failed`);
    }
  }

  // Test 4: Rate Pizza
  function testRatePizza() {
    const baseUrl = TEST_CONFIG.test4_ratePizza.baseUrl;
    
    console.log(`VU ${__VU} [${__ITER}]: Starting pizza rating test`);
    
    const user = createUser();
    
    // Register user first
    const registerResult = registerPizzaUser(baseUrl, user);
    if (!registerResult.success) {
      console.log(`VU ${__VU} [${__ITER}]: User registration failed, skipping rating test`);
      return;
    }

    // Login to get token
    const loginResult = loginPizzaUser(baseUrl, user);
    if (!loginResult.success) {
      console.log(`VU ${__VU} [${__ITER}]: User login failed, skipping rating test`);
      return;
    }

    // Generate random rating
    const rating = generateRandomRating();
    const rateResult = ratePizza(baseUrl, loginResult.token, rating.pizza_id, rating.stars);
    
    if (rateResult.success) {
      console.log(`VU ${__VU} [${__ITER}]: Pizza rated successfully`);
    } else {
      console.log(`VU ${__VU} [${__ITER}]: Pizza rating failed`);
    }
  }

  // Execute tests based on scenario
  if (scenario === 'create_user_test') {
    testCreatePizzaUser();
  } else {
    testRatePizza();
  }

  sleep(1);
} 