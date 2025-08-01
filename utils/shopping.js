import http from 'k6/http';
import { check, sleep } from 'k6';

export function browseCatalog(baseUrl, jar) {
  console.log(`VU ${__VU}: Browsing catalog page`);
  const catalogRes = http.get(`${baseUrl}/notebooks`, { jar });
  
  const catalogSuccess = check(catalogRes, {
    'catalog loaded': (r) => r.status === 200,
  });

  const browseTime = Math.random() * 3 + 2;
  console.log(`VU ${__VU}: Browsing for ${browseTime.toFixed(1)} seconds`);
  sleep(browseTime);

  return { success: catalogSuccess };
}

export function viewProduct(baseUrl, productSlug, jar) {
  console.log(`VU ${__VU}: Viewing product ${productSlug}`);
  
  const productRes = http.get(`${baseUrl}/${encodeURIComponent(productSlug)}`, { jar });
  
  const productSuccess = check(productRes, {
    'product page loaded': (r) => r.status === 200,
  });

  const viewTime = Math.random() * 2 + 1;
  console.log(`VU ${__VU}: Viewing product for ${viewTime.toFixed(1)} seconds`);
  sleep(viewTime);

  return { success: productSuccess, response: productRes };
}

export function addToCart(baseUrl, productId, productSlug, quantity, jar) {
  console.log(`VU ${__VU}: Adding ${quantity} units of product ${productSlug} to cart`);
  
  const productPageRes = http.get(`${baseUrl}/${encodeURIComponent(productSlug)}`, { jar });
  const token = productPageRes.body.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  const newToken = token ? token[1] : '';

  const cartPayload = {
    [`addtocart_${productId}.EnteredQuantity`]: quantity.toString(),
    'CountryId': '0',
    'StateProvinceId': '0',
    'ZipPostalCode': '',
    '__RequestVerificationToken': newToken
  };

  const cookieString = Object.entries(jar.cookiesForURL(baseUrl))
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  const cartRes = http.post(
    `${baseUrl}/addproducttocart/details/${productId}/1`,
    Object.entries(cartPayload)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&'),
    {
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,en-US;q=0.6,ja;q=0.5',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${baseUrl}/${productSlug}`,
        'Origin': baseUrl,
        'Cookie': cookieString
      },
      jar,
    }
  );

  const cartSuccess = check(cartRes, {
    'product added to cart': (r) => r.status === 200,
  });

  sleep(1);
  return { success: cartSuccess };
}

export const PRODUCTS = [
  { id: 6, slug: 'samsung-premium-ultrabook' },
  { id: 4, slug: 'apple-macbook-pro' },
  { id: 8, slug: 'hp-envy-156-inch-sleekbook' },
];

export function getRandomProduct() {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
} 