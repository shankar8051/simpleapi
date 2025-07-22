const express = require('express');
const simpleAPI = require('../index'); // तपाईंको main simpleAPI फाइल

const app = express();
app.use(express.json()); // JSON body parser

// SimpleAPI instance
const api = simpleAPI({
  app,
  db: 'mongo',              // globally active DB
  plugins: [],              // no middleware plugins
  config: { db: 'mongo' }   // optional config
});

// ✅ CRUD without middleware, using 'mongo' as dbName

// GET all items
api.get('/items', 'mongo');

// GET by filter via query (?name=abc)
api.get('/items/:id', 'mongo');

// POST new item
api.post('/items', 'mongo', {
  name: 'required,text',
  value: 'required,number'
}, 'json');

// PUT update item (filtered by query e.g. ?name=abc)
api.put('/items', 'mongo', {
  name: 'text',
  value: 'number'
}, 'json');

// DELETE by filter (e.g. ?name=abc)
api.delete('/items', 'mongo', 'json');

api.app.listen(3000, () => {
  console.log('✅ Server listening at http://localhost:3000');
});
