const express = require('express');
const simpleAPI = require('../index');
const { register, login, guard } = require('../plugins/auth');

const app = express();

const api = simpleAPI({
  app,
  channels: ['http', 'mqtt'],
  mqttOptions: { host: 'mqtt://localhost:1883' },
  db: 'mongo',
  plugins: ['auth'],
  config: { db: 'mongo' }
});
api.get('/get', (req, res) => {
  res.send(`
    <html>
      <head><title>Test Page</title></head>
      <body>
        <h1>✅ This is /get endpoint!</h1>
        <p>Your API is working perfectly.</p>
      </body>
    </html>
  `);
}, 'html');

api.post('/register', register({ dbName: 'mongo' }), {
  email: 'required,text',
  password: 'required,text',
  role: 'text'
}, 'json');

api.post('/login', login({ dbName: 'mongo' }), {
  email: 'required,text',
  password: 'required,text'
}, 'json');

api.get('/secure-admin', guard({ roles: ['admin'] }), (req, res) => {
  res.json({ message: 'Welcome, admin!', user: req.user });
}, 'json');
api.app.listen(3000, () => {
  console.log('✅ HTTP server listening on port 3000');
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});
