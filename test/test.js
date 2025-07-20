const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function test() {
  try {
    console.log('🔹 Registering admin...');
    let res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin'    // role explicitly admin
      })
    });
    let data = await res.json();
    if (!res.ok) {
      console.error('⚠️ Admin register failed:', data);
      return;
    }
    console.log('✅ Admin registered:', data);

    console.log('🔹 Logging in as admin...');
    res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword'
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error('❌ Admin login failed:', data);
      return;
    }
    console.log('✅ Logged in as admin:', data);

    const token = data.token;

    console.log('🔹 Accessing admin-only route...');
    res = await fetch(`${BASE_URL}/secure-admin`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    data = await res.json();
    if (!res.ok) {
      console.error('❌ Admin route failed:', data);
      return;
    }
    console.log('✅ Admin route success:', data);

  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
