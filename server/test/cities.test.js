const assert = require('assert');
const http = require('http');
const app = require('../index');
const { seedCities } = require('../seed/seedCitiesActivities');
const City = require('../models/city');

let server;
let port;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- RUNNING CITY MODULE & API TESTS ---');

  // 1. Seed database
  console.log('1. Seeding cities database...');
  await seedCities();

  // 2. Test City Model - getCities() all
  console.log('2. Testing City.getCities() model...');
  const allCities = await City.getCities();
  console.log(`   Fetched ${allCities.length} cities.`);
  assert(allCities.length >= 15, 'Should have at least 15 seeded cities');

  // 3. Test City Model - Search filtering
  console.log('3. Testing City.getCities({ search: "tokyo" })...');
  const searchResults = await City.getCities({ search: 'tokyo' });
  assert.strictEqual(searchResults.length, 1, 'Should find 1 city matching "tokyo"');
  assert.strictEqual(searchResults[0].name, 'Tokyo');

  // 4. Test City Model - Country filtering
  console.log('4. Testing City.getCities({ country: "japan" })...');
  const countryResults = await City.getCities({ country: 'japan' });
  assert.strictEqual(countryResults.length, 1, 'Should find 1 city in "japan"');
  assert.strictEqual(countryResults[0].country, 'Japan');

  // 5. Start Server for HTTP testing
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });

  try {
    // 6. Test GET /api/cities
    console.log('6. Testing HTTP GET /api/cities...');
    const res1 = await makeRequest('/api/cities');
    assert.strictEqual(res1.statusCode, 200);
    assert(Array.isArray(res1.body), 'Response body should be an array');
    assert(res1.body.length >= 15, 'Response should contain at least 15 cities');

    // 7. Test GET /api/cities?search=paris
    console.log('7. Testing HTTP GET /api/cities?search=paris...');
    const res2 = await makeRequest('/api/cities?search=paris');
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.body.length, 1);
    assert.strictEqual(res2.body[0].name, 'Paris');
    assert.strictEqual(res2.body[0].country, 'France');

    // 8. Test GET /api/cities?country=Thailand
    console.log('8. Testing HTTP GET /api/cities?country=Thailand...');
    const res3 = await makeRequest('/api/cities?country=Thailand');
    assert.strictEqual(res3.statusCode, 200);
    assert.strictEqual(res3.body.length, 1);
    assert.strictEqual(res3.body[0].name, 'Bangkok');

    // 9. Test GET /api/cities?search=Den&country=Indonesia
    console.log('9. Testing HTTP GET /api/cities?search=Den&country=Indonesia...');
    const res4 = await makeRequest('/api/cities?search=Den&country=Indonesia');
    assert.strictEqual(res4.statusCode, 200);
    assert.strictEqual(res4.body.length, 1);
    assert.strictEqual(res4.body[0].name, 'Denpasar (Bali)');

    // 10. Test GET /api/cities?search=NonExistentCity
    console.log('10. Testing HTTP GET /api/cities?search=NonExistentCity...');
    const res5 = await makeRequest('/api/cities?search=NonExistentCity');
    assert.strictEqual(res5.statusCode, 200);
    assert.strictEqual(res5.body.length, 0);

    console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  if (server) server.close();
  process.exit(1);
});
