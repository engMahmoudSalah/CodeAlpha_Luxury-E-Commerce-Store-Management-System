import http from 'http';
import { app } from './server.js';
import { db, initDatabase } from './config/database.js';

initDatabase();

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    process.exitCode = 1;
  }
}

async function runAuthRegression() {
  console.log('====================================================');
  console.log('🛡️ Starting Auth & Cookie Regression Tests...');
  console.log('====================================================');

  const server = app.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;

    function makeRequest(options, postData) {
      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          }));
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
      });
    }

    try {
      console.log('--- 1. Testing Embedded/HTTPS Context (AI Studio iframe) ---');
      const emailProd = `prod_${Date.now()}@example.com`;
      
      const prodRegRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https' }
      }, JSON.stringify({ name: 'ProdTest', email: emailProd, password: 'password123' }));
      
      const prodCookies = prodRegRes.headers['set-cookie'];
      assert(prodCookies && prodCookies.length > 0, 'Set-Cookie header present (HTTPS)');
      const prodCookieConfig = prodCookies[0];
      
      assert(prodCookieConfig.includes('SameSite=None'), 'HTTPS cookie uses SameSite=None');
      assert(prodCookieConfig.includes('Secure'), 'HTTPS cookie is Secure');
      assert(prodCookieConfig.includes('HttpOnly'), 'HTTPS Cookie is HttpOnly');
      
      const prodSessionCookie = prodCookies[0].split(';')[0];
      
      const prodMeRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/me', method: 'GET',
        headers: { 'Cookie': prodSessionCookie, 'X-Forwarded-Proto': 'https' }
      });
      assert(prodMeRes.status === 200, 'Authentication persists after navigation (HTTPS)');

      console.log('--- 2. Testing Local Development Context (HTTP Localhost) ---');
      const emailLocal = `local_${Date.now()}@example.com`;
      
      const localRegRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, JSON.stringify({ name: 'LocalTest', email: emailLocal, password: 'password123' }));
      
      const localCookies = localRegRes.headers['set-cookie'];
      assert(localCookies && localCookies.length > 0, 'Set-Cookie header present (HTTP)');
      const localCookieConfig = localCookies[0];
      
      assert(localCookieConfig.includes('SameSite=Lax'), 'HTTP cookie uses SameSite=Lax');
      assert(!localCookieConfig.includes('Secure'), 'HTTP cookie is NOT Secure');
      assert(localCookieConfig.includes('HttpOnly'), 'HTTP Cookie is HttpOnly');
      
      const localSessionCookie = localCookies[0].split(';')[0];
      
      const localMeRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/me', method: 'GET',
        headers: { 'Cookie': localSessionCookie }
      });
      assert(localMeRes.status === 200, 'Authentication persists after navigation (HTTP)');
      
      console.log('--- 3. Testing Session Logout & Invalidation ---');
      const logoutRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/logout', method: 'POST',
        headers: { 'Cookie': localSessionCookie }
      });
      assert(logoutRes.status === 200, 'Logout successful');
      
      const loggedOutMeRes = await makeRequest({
        hostname: '127.0.0.1', port, path: '/api/auth/me', method: 'GET',
        headers: { 'Cookie': localSessionCookie }
      });
      assert(loggedOutMeRes.status === 401, 'Old session cookie rejected after logout');

    } catch (err) {
      console.error(err);
      failed++;
    } finally {
      server.close();
      console.log('====================================================');
      console.log(`📊 Auth & Cookie Regression Test Summary: ${passed} Passed, ${failed} Failed`);
      console.log('====================================================');
    }
  });
}

runAuthRegression();
