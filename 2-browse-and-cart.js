import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

// Test configuration
export const options = {
  scenarios: {
    browse_and_cart: {
      executor: "per-vu-iterations",
      vus: 2, // Reduced from 10 to 2 users
      iterations: 1, // Reduced from 5 to 1 iteration
      maxDuration: "1m", // Reduced from 10m to 1m
    },
  },
};

// Simulate user credentials
const users = new SharedArray("users", function () {
  return [
    { email: "test.user1@example.com", password: "Test@123" },
    { email: "test.user2@example.com", password: "Test@123" },
    { email: "test.user3@example.com", password: "Test@123" },
    { email: "test.user4@example.com", password: "Test@123" },
    { email: "test.user5@example.com", password: "Test@123" },
    { email: "test.user6@example.com", password: "Test@123" },
    { email: "test.user7@example.com", password: "Test@123" },
    { email: "test.user8@example.com", password: "Test@123" },
    { email: "test.user9@example.com", password: "Test@123" },
    { email: "test.user10@example.com", password: "Test@123" },
  ];
});

export default function () {
  const baseUrl = "http://localhost:5000";
  const jar = http.cookieJar();
  const currentUser = users[__VU % users.length];

  // Step 1: Get login page to extract token
  console.log(
    `VU ${__VU} [${__ITER}]: Getting login page for ${currentUser.email}`
  );
  const loginPageRes = http.get(`${baseUrl}/login`);
  console.log(
    `VU ${__VU} [${__ITER}]: Login page GET status: ${loginPageRes.status}`
  );

  // Extract verification token
  const m = loginPageRes.body.match(
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/
  );
  const token = m ? m[1] : "";
  console.log(`VU ${__VU} [${__ITER}]: Extracted token:`, token);

  check(token, { "token found": (t) => !!t });

  // Step 2: Login with token
  console.log(`VU ${__VU} [${__ITER}]: Attempting login with token`);
  const loginPayload = {
    Email: currentUser.email,
    Password: currentUser.password,
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

  console.log(
    `VU ${__VU} [${__ITER}]: Login response status: ${loginRes.status}`
  );
  console.log(
    `VU ${__VU} [${__ITER}]: Login response body length: ${loginRes.body.length}`
  );

  check(loginRes, {
    "login successful": (r) =>
      r.status === 200 && r.body.includes("Tài khoản của tôi"),
  });

  sleep(2);

  // Step 2: Browse catalog
  console.log(`VU ${__VU} [${__ITER}]: Browsing catalog page`);
  const catalogRes = http.get(`${baseUrl}/notebooks`, { jar });
  console.log(
    `VU ${__VU} [${__ITER}]: Catalog response status: ${catalogRes.status}`
  );

  check(catalogRes, {
    "catalog loaded": (r) => r.status === 200,
  });

  const browseSleep = Math.random() * 3 + 2;
  console.log(
    `VU ${__VU} [${__ITER}]: Simulating browsing for ${browseSleep.toFixed(
      1
    )} seconds`
  );
  sleep(browseSleep);

  // Step 3: View random products (30% chance for each user)
  const willViewProduct = 1;
  console.log(`VU ${__VU} [${__ITER}]: Will view product? ${willViewProduct}`);

  // List of products with fixed names and IDs
  const products = [
    { id: 6, slug: "samsung-premium-ultrabook" },
    { id: 4, slug: "apple-macbook-pro" },
    { id: 8, slug: "hp-envy-156-inch-sleekbook" },
  ];

  let randomProduct;
  if (willViewProduct) {
    randomProduct = products[Math.floor(Math.random() * products.length)];
    console.log(`VU ${__VU} [${__ITER}]: Viewing product (${randomProduct.slug})`);

    const productRes = http.get(
      `${baseUrl}/${encodeURIComponent(randomProduct.slug)}`,
      { jar }
    );
    console.log(
      `VU ${__VU} [${__ITER}]: Product page response status: ${productRes.status}`
    );

    // Extract new token from product page
    const productToken = productRes.body.match(
      /name="__RequestVerificationToken"[^>]*value="([^"]+)"/
    );
    const newToken = productToken ? productToken[1] : "";
    console.log(`VU ${__VU} [${__ITER}]: Extracted new token from product page:`, newToken);

    check(newToken, { "product page token found": (t) => !!t });

    const viewSleep = Math.random() * 2 + 1;
    console.log(
      `VU ${__VU} [${__ITER}]: Viewing product for ${viewSleep.toFixed(1)} seconds`
    );
    sleep(viewSleep);

    // Move cart logic inside willViewProduct block
    const willAddToCart = 1;
    console.log(`VU ${__VU} [${__ITER}]: Will add to cart? ${willAddToCart}`);

    if (willAddToCart) {
      const quantity = Math.floor(Math.random() * 3) + 1;
      console.log(
        `VU ${__VU} [${__ITER}]: Adding ${quantity} units of product ${randomProduct.slug} (ID: ${randomProduct.id}) to cart`
      );

      const cartPayload = {
        [`addtocart_${randomProduct.id}.EnteredQuantity`]: quantity.toString(),
        'CountryId': '0',
        'StateProvinceId': '0',
        'ZipPostalCode': '',
        '__RequestVerificationToken': newToken  // Use new token instead of login token
      };

      // Get all cookies as a single string
      const cookieString = Object.entries(jar.cookiesForURL(baseUrl))
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
      
      // Add this line to log the cookie string
      console.log(`VU ${__VU} [${__ITER}]: Cookie string:`, cookieString);
      
      const cartRes = http.post(
        `${baseUrl}/addproducttocart/details/${randomProduct.id}/1`,
        Object.entries(cartPayload)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&'),
        {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "*/*",
            "Accept-Language": "en-GB,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,en-US;q=0.6,ja;q=0.5",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `${baseUrl}/${randomProduct.slug}`,
            "Origin": baseUrl,
            "Cookie": cookieString
          },
          jar,
        }
      );

      console.log(
        `VU ${__VU} [${__ITER}]: Add to cart response status: ${cartRes.status}`
      );

      check(cartRes, {
        "product added to cart": (r) => r.status === 200,
      });

      sleep(1);
    }
  }

  const finalSleep = Math.random() * 2 + 1;
  console.log(
    `VU ${__VU} [${__ITER}]: Final sleep for ${finalSleep.toFixed(1)} seconds`
  );
  sleep(finalSleep);
}
