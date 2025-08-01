import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { registerUser, loginUser, logoutUser } from "./utils/auth.js";
import {
  browseCatalog,
  viewProduct,
  addToCart,
  getRandomProduct,
} from "./utils/shopping.js";
import { TEST_CONFIG } from "./config/test-config.js";

// Get scenario from environment variable
const scenario = __ENV.SCENARIO || 'registration_test';

// Only load the selected scenario
const scenarios = {};
scenarios[scenario] = scenario === 'registration_test' ? {
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    {
      duration: TEST_CONFIG.test1_registration.rampUpTime,
      target: TEST_CONFIG.test1_registration.maxUsers,
    },
    {
      duration: TEST_CONFIG.test1_registration.loadTime,
      target: TEST_CONFIG.test1_registration.maxUsers,
    },
    { duration: TEST_CONFIG.test1_registration.rampDownTime, target: 0 },
  ],
  gracefulRampDown: TEST_CONFIG.test1_registration.rampDownTime,
} : {
  executor: "per-vu-iterations",
  vus: TEST_CONFIG.test2_shopping.virtualUsers,
  iterations: TEST_CONFIG.test2_shopping.iterationsPerUser,
  maxDuration: TEST_CONFIG.test2_shopping.maxDuration,
};

export const options = {
  scenarios: scenarios
};

const users = new SharedArray("users", function () {
  return TEST_CONFIG.test2_shopping.users;
});

export default function () {
  const jar = http.cookieJar();

  // Test 1: User Registration
  function testUserRegistration() {
    const baseUrl = TEST_CONFIG.test1_registration.baseUrl;
    
    console.log(`VU ${__VU} [${__ITER}]: Starting user registration test`);

    const userData = {
      firstName: "Test",
      lastName: "User",
      email: `testuser_${__VU}_${Date.now()}@example.com`,
      password: "Admin@123",
    };

    const result = registerUser(baseUrl, userData, jar);

    if (result.success) {
      console.log(`VU ${__VU} [${__ITER}]: Registration successful`);
    } else {
      console.log(`VU ${__VU} [${__ITER}]: Registration failed`);
    }

    sleep(Math.random() * 3 + 2);
  }

  // Test 2: Shopping Cart Flow
  function testShoppingCart() {
    const baseUrl = TEST_CONFIG.test2_shopping.baseUrl;
    const currentUser = users[__VU % users.length];
    
    console.log(`VU ${__VU} [${__ITER}]: Starting shopping cart test`);

    // Step 1: Login
    const loginResult = loginUser(
      baseUrl,
      currentUser.email,
      currentUser.password,
      jar
    );

    if (!loginResult.success) {
      console.log(
        `VU ${__VU} [${__ITER}]: Login failed, skipping shopping test`
      );
      return;
    }

    sleep(2);

    // Step 2: Browse catalog
    const browseResult = browseCatalog(baseUrl, jar);

    if (!browseResult.success) {
      console.log(`VU ${__VU} [${__ITER}]: Failed to browse catalog`);
      return;
    }

    // Step 3: View random product
    const randomProduct = getRandomProduct();
    const viewResult = viewProduct(baseUrl, randomProduct.slug, jar);

    if (viewResult.success) {
      // Step 4: Add to cart
      const quantity = Math.floor(Math.random() * 3) + 1;
      const cartResult = addToCart(
        baseUrl,
        randomProduct.id,
        randomProduct.slug,
        quantity,
        jar
      );

      if (cartResult.success) {
        console.log(
          `VU ${__VU} [${__ITER}]: Successfully added product to cart`
        );

        // Step 5: Logout after adding to cart
        sleep(1);
        const logoutResult = logoutUser(baseUrl, jar);

        if (logoutResult.success) {
          console.log(
            `VU ${__VU} [${__ITER}]: Shopping cart test completed successfully`
          );
        } else {
          console.log(
            `VU ${__VU} [${__ITER}]: Shopping cart test completed but logout failed`
          );
        }
      } else {
        console.log(`VU ${__VU} [${__ITER}]: Failed to add product to cart`);
      }
    }

    sleep(Math.random() * 2 + 1);
  }

  // Execute tests based on scenario
  if (scenario === 'registration_test') {
    testUserRegistration();
  } else {
    testShoppingCart();
  }
}
