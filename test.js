import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1, // chỉ 1 VU
  iterations: 5, // tổng 5 lượt chạy -> 5 tài khoản được tạo
};

export default function () {
  const randomId = Math.floor(Math.random() * 100000);
  const url = 'https://quickpizza.grafana.com/api/users';
  const payload = JSON.stringify({
    username: `user_${randomId}`,
    password: 'pass1234',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });
}
