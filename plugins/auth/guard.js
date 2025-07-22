const jwt = require('jsonwebtoken');

function guard(config = {}) {
  const {
    token = 'jwt',
    secret = 'simpleapi-secret',
    header = 'authorization',
    roles = null,          // e.g., ['admin', 'moderator']
    dbName = 'json',       // default database
    table = 'users'        // default table name
  } = config;

  return async (req, res, next) => {
    if (token !== 'jwt') return next();

    const authHeader = req.headers[header.toLowerCase()];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const bearer = authHeader.split(' ');
    const tokenValue = bearer.length === 2 ? bearer[1] : bearer[0];

    // context बाट DB instance लिनुहोस्
    const context = req.app.__context;
    const database = context?.db?.get(dbName);

    if (!database || typeof database.find !== 'function') {
      return res.status(500).json({ error: 'Database not found or invalid' });
    }

    // jwt.verify लाई Promise style मा wrap गर्न सकिन्छ:
    jwt.verify(tokenValue, secret, async (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });

      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      // DB बाट user खोज्ने भाग
      try {
        const userList = await database.find(table, {
          filter: { email: decoded.email }
        });

        if (!userList || userList.length === 0) {
          return res.status(401).json({ error: 'User not found in database' });
        }

        req.user = decoded;
        next();

      } catch (e) {
        console.error('Database query error:', e);
        return res.status(500).json({ error: 'Database query failed' });
      }
    });
  };
}

module.exports = guard;
