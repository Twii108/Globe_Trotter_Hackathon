const jwt = require('jsonwebtoken');
const app = require('./server/index');
const { JWT_SECRET } = require('./server/middleware/authMiddleware');
const http = require('http');

async function runTests() {
  const PORT = 5891;
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  // Helper for HTTP requests
  function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  let testPassed = true;

  try {
    // 1. Generate JWT tokens for users
    const user42Token = jwt.sign({ id: 42, name: 'Alice Explorer' }, JWT_SECRET, { expiresIn: '1h' });
    const user99Token = jwt.sign({ id: 99, name: 'Bob Voyager' }, JWT_SECRET, { expiresIn: '1h' });

    console.log('\n--- Test 1: POST /api/trips without Auth Header ---');
    const resNoAuth = await request('POST', '/api/trips', { name: 'Unauthorized Trip' });
    console.log('Status:', resNoAuth.status, 'Response:', resNoAuth.body);
    if (resNoAuth.status === 401) {
      console.log('✅ PASS: Unauthorized request correctly rejected with 401.');
    } else {
      console.error('❌ FAIL: Expected status 401, got', resNoAuth.status);
      testPassed = false;
    }

    console.log('\n--- Test 2: POST /api/trips with User 42 JWT ---');
    const trip1Data = {
      name: 'Summer in Paris',
      start_date: '2026-07-01',
      end_date: '2026-07-15',
      description: 'Backpacking in France',
      cover_photo_url: 'https://images.unsplash.com/paris.jpg'
    };
    const resTrip1 = await request('POST', '/api/trips', trip1Data, user42Token);
    console.log('Status:', resTrip1.status, 'Response:', resTrip1.body);
    if (
      resTrip1.status === 201 &&
      resTrip1.body.id &&
      resTrip1.body.user_id === 42 &&
      resTrip1.body.name === trip1Data.name &&
      resTrip1.body.description === trip1Data.description &&
      resTrip1.body.created_at
    ) {
      console.log('✅ PASS: Trip 1 created successfully with all required fields.');
    } else {
      console.error('❌ FAIL: Trip 1 creation failed or missing fields.');
      testPassed = false;
    }

    console.log('\n--- Test 3: POST /api/trips (Second trip for User 42) ---');
    const trip2Data = {
      name: 'Tokyo Adventure',
      start_date: '2026-10-10',
      end_date: '2026-10-24',
      description: 'Exploring Shibuya & Kyoto',
      cover_photo_url: 'https://images.unsplash.com/tokyo.jpg'
    };
    const resTrip2 = await request('POST', '/api/trips', trip2Data, user42Token);
    console.log('Status:', resTrip2.status, 'Response:', resTrip2.body);
    if (resTrip2.status === 201 && resTrip2.body.user_id === 42) {
      console.log('✅ PASS: Second trip for User 42 created successfully.');
    } else {
      console.error('❌ FAIL: Trip 2 creation failed.');
      testPassed = false;
    }

    console.log('\n--- Test 4: POST /api/trips for User 99 JWT ---');
    const trip3Data = {
      name: 'Grand Canyon Hike',
      start_date: '2026-09-05',
      end_date: '2026-09-10',
      description: 'Camping trip',
      cover_photo_url: null
    };
    const resTrip3 = await request('POST', '/api/trips', trip3Data, user99Token);
    console.log('Status:', resTrip3.status, 'Response:', resTrip3.body);
    if (resTrip3.status === 201 && resTrip3.body.user_id === 99) {
      console.log('✅ PASS: Trip for User 99 created successfully.');
    } else {
      console.error('❌ FAIL: User 99 trip creation failed.');
      testPassed = false;
    }

    console.log('\n--- Test 5: GET /api/trips for User 42 JWT ---');
    const resGet42 = await request('GET', '/api/trips', null, user42Token);
    console.log('Status:', resGet42.status, 'Trips count:', resGet42.body.length);
    if (resGet42.status === 200 && Array.isArray(resGet42.body) && resGet42.body.length === 2) {
      console.log('✅ PASS: GET /api/trips returned 2 trips for User 42.');
    } else {
      console.error('❌ FAIL: GET /api/trips for User 42 failed.');
      testPassed = false;
    }

    console.log('\n--- Test 6: GET /api/trips for User 99 JWT ---');
    const resGet99 = await request('GET', '/api/trips', null, user99Token);
    console.log('Status:', resGet99.status, 'Trips count:', resGet99.body.length);
    if (resGet99.status === 200 && Array.isArray(resGet99.body) && resGet99.body.length === 1) {
      console.log('✅ PASS: GET /api/trips returned 1 trip for User 99.');
    } else {
      console.error('❌ FAIL: GET /api/trips for User 99 failed.');
      testPassed = false;
    }

  } catch (err) {
    console.error('Test execution error:', err);
    testPassed = false;
  } finally {
    server.close();
    if (testPassed) {
      console.log('\n==================================');
      console.log('🎉 ALL JWT TRIP BACKEND TESTS PASSED!');
      console.log('==================================\n');
      process.exit(0);
    } else {
      console.error('\n❌ SOME TESTS FAILED.');
      process.exit(1);
    }
  }
}

runTests();
