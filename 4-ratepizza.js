import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  vus: 10,
  duration: '30s',
  rps: 5, // giới hạn tổng 5 req/s
};

function createUser() {
  const username = `${randomString(6)}@example.com`;
  const password = 'secret123';
  return { username, password };
}

const BASE_URL = 'https://quickpizza.grafana.com';

export default function () {
  const user = createUser();
  console.log(`🟡 [${__VU}] Creating user: ${user.username}`);

  // Register
  const registerRes = http.post(`${BASE_URL}/api/users`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(registerRes, {
    '✅ Register success (201)': (r) => r.status === 201,
  }) || console.error(`❌ Register failed: ${registerRes.status} - ${registerRes.body}`);

  // Login
  const loginRes = http.post(`${BASE_URL}/api/users/token/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  const token = loginRes.json('token');
  check(token, {
    '✅ Login success': () => token && token.length > 0,
  }) || console.error(`❌ Login failed: ${loginRes.status} - ${loginRes.body}`);

  console.log(`🟢 [${__VU}] Logged in with token: ${token}`);

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // Rate pizza
  const payload = {
    stars: randomIntBetween(1, 5),
    pizza_id: randomIntBetween(1, 3),
  };

  console.log(`🔵 [${__VU}] Rating pizza_id=${payload.pizza_id} with stars=${payload.stars}`);
  const rateRes = http.post(`${BASE_URL}/api/ratings`, JSON.stringify(payload), headers);
  check(rateRes, {
    '✅ Rating success (201)': (r) => r.status === 201,
  }) || console.error(`❌ Rating failed: ${rateRes.status} - ${rateRes.body}`);
}
