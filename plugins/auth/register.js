const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function register(config = {}) {
  const {
    token = 'jwt',
    role = 'user',
    dbName = 'json',
    table = 'users',
    identifier = 'email',
    secret = 'mysecret',
    expiresIn = '1h'
  } = config;

  return async (req, res, next) => {
    try {
      const db = req.app.__context?.db.get(dbName);
      console.log('Register: DB instance =', db ? 'FOUND' : 'NULL');
      if (!db) {
        return res.status(500).json({ error: 'DB not available' });
      }

      const data = req.body;
      if (!data?.[identifier] || !data?.password) {
        return res.status(400).json({ error: `Missing ${identifier} or password` });
      }

      // Query filter for your DB adapter
      const filterQuery = { filter: { [identifier]: { op: '=', value: data[identifier] } } };

      const existing = await db.find(table, filterQuery);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashed = await bcrypt.hash(data.password, 10);
      const newUser = {
        ...data,
        password: hashed,
        role,
        createdAt: new Date()
      };

      const inserted = await db.insert(table, newUser);

      if (token === 'jwt') {
        const payload = {
          id: inserted._id || inserted.id,
          [identifier]: data[identifier],
          role
        };
        const authToken = jwt.sign(payload, secret, { expiresIn });
        return res.json({ token: authToken, user: payload });
      }

      return res.json({ message: 'Registered', user: inserted });
    } catch (err) {
      console.error('⚠️ Register error:', err);
      return res.status(500).json({ error: 'Registration failed' });
    }
  };
}

module.exports = register;
