const validator = require('./validator');
const queryParser = require('./queryParser');
const dbUtils = require('../db'); // for getTable()

function router(context) {
  const { app, db, config } = context;  // config पनि ल्याउने

  function handle(method) {
    return (route, ...args) => {
      // Args: [middleware?, dbName?, schema?, options?]
      const middleware = typeof args[0] === 'function' ? args.shift() : (req, res, next) => next();
      const dbName = typeof args[0] === 'string' ? args.shift() : null;
      const schema = typeof args[0] === 'object' ? args.shift() : null;
      const options = typeof args[0] === 'object' ? args.shift() : {};

      app[method](route, middleware, async (req, res) => {
        try {
          const body = req.body || {};
          const query = req.query || {};

          // default dbName: explicit dbName -> config.db -> 'json'
          const usedDbName = dbName || config.db || 'json';

          // db instance लिनुहोस्
          const database = db.get(usedDbName);
          if (!database || typeof database.find !== 'function') {
            return res.status(500).json({ error: 'Database not found or invalid' });
          }

          // route बाट table name निकाल्नुहोस्
          const table = dbUtils.getTable(usedDbName, route);

          // POST/PUT मा schema validation गर्नुहोस्
          if (schema && ['post', 'put'].includes(method)) {
            const error = validator.validate(body, schema);
            if (error) return res.status(400).json({ error });
          }

          // HTTP method अनुसार DB operation गर्नुहोस्
          if (method === 'get') {
            const parsed = queryParser.parse(query, schema, options);
            const result = await database.find(table, parsed);
            return res.json(result);
          }

          if (method === 'post') {
            const inserted = await database.insert(table, body);
            return res.status(201).json(inserted);
          }

          if (method === 'put') {
            const result = await database.update(table, query, body);
            return res.json(result);
          }

          if (method === 'delete') {
            const result = await database.remove(table, query);
            return res.json(result);
          }

          // यदि method allowed नभए
          res.status(405).json({ error: 'Method not allowed' });

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
