import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export function createUser() {
  const username = `${randomString(6)}@example.com`;
  const password = 'secret123';
  return { username, password };
}

export function registerPizzaUser(baseUrl, user) {
  console.log(`VU ${__VU}: Creating user: ${user.username}`);
  
  const registerRes = http.post(`${baseUrl}/api/users`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const registerSuccess = check(registerRes, {
    'register success': (r) => r.status === 201,
  });
  
  if (!registerSuccess) {
    console.error(`Register failed: ${registerRes.status} - ${registerRes.body}`);
  }
  
  return { success: registerSuccess };
}

export function loginPizzaUser(baseUrl, user) {
  const loginRes = http.post(`${baseUrl}/api/users/token/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const token = loginRes.json('token');
  const loginSuccess = check(token, {
    'login success': () => token && token.length > 0,
  });
  
  if (!loginSuccess) {
    console.error(`Login failed: ${loginRes.status} - ${loginRes.body}`);
  }
  
  console.log(`VU ${__VU}: Logged in with token: ${token}`);
  return { success: loginSuccess, token };
}

export function ratePizza(baseUrl, token, pizzaId, stars) {
  console.log(`VU ${__VU}: Rating pizza_id=${pizzaId} with stars=${stars}`);
  
  const payload = { stars, pizza_id: pizzaId };
  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const rateRes = http.post(`${baseUrl}/api/ratings`, JSON.stringify(payload), headers);
  
  const rateSuccess = check(rateRes, {
    'rating success': (r) => r.status === 201,
  });
  
  if (!rateSuccess) {
    console.error(`Rating failed: ${rateRes.status} - ${rateRes.body}`);
  }
  
  return { success: rateSuccess };
}

export function generateRandomRating() {
  return {
    stars: randomIntBetween(1, 5),
    pizza_id: randomIntBetween(1, 3),
  };
} 