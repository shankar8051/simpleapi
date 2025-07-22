const axios = require('axios');
const baseURL = 'http://localhost:3000/items';

async function runTests() {
  try {
    console.log('🟢 Creating new item...');
    const createRes = await axios.post(baseURL, {
      name: 'banana',
      value: 99
    });
    console.log('✅ Created:', createRes.data);

    console.log('🟢 Fetching items...');
    const fetchRes = await axios.get(baseURL);
    console.log('✅ Items:', fetchRes.data);

    console.log('🟢 Updating item...');
    const updateRes = await axios.put(baseURL + '?name=banana', {
      name: 'banana',  // ✅ explicitly include for validation
      value: 120
    });
    console.log('✅ Updated:', updateRes.data);

    console.log('🟢 Deleting item...');
    const deleteRes = await axios.delete(baseURL + '?name=banana');
    console.log('✅ Deleted:', deleteRes.data);

  } catch (err) {
    console.error('❌ Error during test:', err.response?.data || err.message);
  }
}

runTests();
