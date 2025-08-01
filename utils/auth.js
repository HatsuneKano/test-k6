import http from "k6/http";
import { check } from "k6";

export function extractToken(responseBody) {
  const match = responseBody.match(
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/
  );
  return match ? match[1] : "";
}

export function loginUser(baseUrl, email, password, jar) {
  console.log(`VU ${__VU}: Getting login page for ${email}`);
  const loginPageRes = http.get(`${baseUrl}/login`);

  const token = extractToken(loginPageRes.body);
  check(token, { "token found": (t) => !!t });

  const loginPayload = {
    Email: email,
    Password: password,
    __RequestVerificationToken: token,
    RememberMe: "false",
  };

  const loginRes = http.post(
    `${baseUrl}/login`,
    Object.entries(loginPayload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&"),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      jar,
    }
  );

  const loginSuccess = check(loginRes, {
    "login successful": (r) =>
      r.status === 200 && r.body.includes("Tài khoản của tôi"),
  });

  return { success: loginSuccess, token };
}

export function registerUser(baseUrl, userData, jar) {
  console.log(`VU ${__VU}: Starting registration for ${userData.email}`);

  const registerPageRes = http.get(`${baseUrl}/register`);
  const token = extractToken(registerPageRes.body);

  check(token, { "token found": (t) => !!t });

  const payload = {
    Gender: "M",
    FirstName: userData.firstName,
    LastName: userData.lastName,
    Email: userData.email,
    Password: userData.password,
    ConfirmPassword: userData.password,
    Newsletter: "false",
    __RequestVerificationToken: token,
    "register-button": "",
  };

  const registerRes = http.post(
    `${baseUrl}/register?returnUrl=%2F`,
    Object.entries(payload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&"),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      jar,
    }
  );

  const registerSuccess = check(registerRes, {
    "registration successful": (r) =>
      r.status === 200 && r.body.includes("/logout"),
  });

  return { success: registerSuccess };
}

export function logoutUser(baseUrl, jar) {
  console.log(`VU ${__VU}: Logging out user`);

  const logoutRes = http.get(`${baseUrl}/logout`, { jar });

  const logoutSuccess = check(logoutRes, {
    "logout successful": (r) =>
      r.status === 200 &&
      (r.body.includes("login") || r.body.includes("register")),
  });

  if (logoutSuccess) {
    console.log(`VU ${__VU}: User logged out successfully`);
  } else {
    console.log(`VU ${__VU}: Logout failed`);
  }

  return { success: logoutSuccess };
}
