import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    register_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },    // Ramp up to 5 users in 10s
        { duration: '1m', target: 5 },     // Stay at 5 users for 1 minute
        { duration: '5s', target: 0 },     // Ramp down to 0 in 5s
      ],
      gracefulRampDown: '5s',
    },
  },
};

export default function () {
  const url = 'http://localhost:5000/register';
  const jar = http.cookieJar();
  
  console.log(`VU ${__VU}: Starting registration flow`);

  const resGet = http.get(url);
  console.log(`VU ${__VU}: GET response status:`, resGet.status);

  const m = resGet.body.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  const token = m ? m[1] : '';
  console.log(`VU ${__VU}: Extracted token:`, token);
  
  check(token, { 'token found': (t) => !!t });

  const payload = {
    Gender: 'M',
    FirstName: 'dao',
    LastName: 'dao',
    Email: `dao+${__VU}_${Date.now()}@mail.com`,
    Password: 'Admin@123',
    ConfirmPassword: 'Admin@123',
    Newsletter: 'false',
    __RequestVerificationToken: token,
    'register-button': ''
  };

  console.log(`VU ${__VU}: Registration payload:`, JSON.stringify(payload, null, 2));

  const params = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    jar
  };

  console.log(`VU ${__VU}: Making POST request for registration...`);
  const resPost = http.post(url + '?returnUrl=%2F',
    Object.entries(payload)
      .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&'),
    params
  );

  console.log(`VU ${__VU}: POST response status:`, resPost.status);

  const checkResults = check(resPost, {
    '200 OK': (r) => r.status === 200,
    'đăng ký thành công': (r) => r.body.includes('/logout')
  });

  console.log(`VU ${__VU}: Check results:`, checkResults);
  
  // Add sleep to simulate real user behavior
  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
}
