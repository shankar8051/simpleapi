const validator = require('./validator');
const queryParser = require('./queryParser');
const dbUtils = require('../db'); // for getTable()

function router(context) {
  const { app, db } = context;

  function handle(method) {
    return (route, ...args) => {
      // Arg order: [middleware?, dbName?, schema?, options?]
      const middleware = typeof args[0] === 'function' ? args.shift() : (req, res, next) => next();
      const dbName = typeof args[0] === 'string' ? args.shift() : null;
      const schema = typeof args[0] === 'object' ? args.shift() : null;
      const options = typeof args[0] === 'object' ? args.shift() : {};

      app[method](route, middleware, async (req, res) => {
        try {
          const body = req.body || {};
          const query = req.query || {};

          const database = db; // ✅ already selected in index.js
          const table = dbUtils.getTable(dbName, route); // ✅ use helper to get table name

          // Validation for POST/PUT
          if (schema && ['post', 'put'].includes(method)) {
            const error = validator.validate(body, schema);
            if (error) return res.status(400).json({ error });
          }

          // Handle GET
          if (method === 'get') {
            const parsed = queryParser.parse(query, schema, options);
            const result = await database.find(table, parsed);
            return res.json(result);
          }

          // Handle POST
          if (method === 'post') {
            const inserted = await database.insert(table, body);
            return res.status(201).json(inserted);
          }

          // Handle PUT
          if (method === 'put') {
            const result = await database.update(table, query, body);
            return res.json(result);
          }

          // Handle DELETE
          if (method === 'delete') {
            const result = await database.remove(table, query);
            return res.json(result);
          }

        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Error' });
        }
      });
    };
  }

  return {
    get: handle('get'),
    post: handle('post'),
    put: handle('put'),
    delete: handle('delete')
  };
}

module.exports = router;
