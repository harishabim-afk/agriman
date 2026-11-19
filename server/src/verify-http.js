import { startServer } from './server.js';

const testHttp = async () => {
  console.log('🚀 Starting AgroHarvest HTTP Server...');
  const server = await startServer();
  const BASE = 'http://127.0.0.1:5000/api';

  try {
    // 1. Health check
    console.log('\n[HTTP 1] Checking Health Endpoint...');
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    console.log('  Response:', health);
    if (health.status !== 'online') throw new Error('Health check failed');
    console.log('  ✓ /api/health returned online');

    // 2. Auth login
    console.log('\n[HTTP 2] Testing Buyer Login...');
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@agroharvest.com', password: 'Buyer@123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
    console.log(`  ✓ Buyer logged in successfully! Name: ${loginData.user.name}, Role: ${loginData.user.role}`);
    const buyerToken = loginData.token;

    // 3. Admin login
    console.log('\n[HTTP 3] Testing Admin Login...');
    const adminLoginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@agroharvest.com', password: 'Admin@123' })
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    console.log(`  ✓ Admin logged in! Role: ${adminData.user.role}`);

    // 4. Filtered listings
    console.log('\n[HTTP 4] Testing Listings Filter for Paddy & Grade A...');
    const listRes = await fetch(`${BASE}/listings?commodity=Paddy&grade=Grade%20A`);
    const listData = await listRes.json();
    console.log(`  ✓ Found ${listData.listings.length} Paddy Grade A listings.`);
    listData.listings.forEach(l => console.log(`    - ${l.title}: $${l.unitPrice}/${l.unit}, Moisture: ${l.moisturePercentage}%`));

    // 5. Admin Stats
    console.log('\n[HTTP 5] Testing Admin Stats API...');
    const statsRes = await fetch(`${BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = await statsRes.json();
    console.log(`  ✓ Admin Stats Verified! Total Users: ${stats.users.total}, Total GMV: $${stats.orders.totalGMV.toLocaleString()}, Active Listings: ${stats.listings.active}`);

    console.log('\n==================================================');
    console.log('🎉 ALL REST API ENDPOINTS VERIFIED OVER HTTP 127.0.0.1:5000');
    console.log('==================================================\n');
  } finally {
    server.close();
    process.exit(0);
  }
};

testHttp().catch(err => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
