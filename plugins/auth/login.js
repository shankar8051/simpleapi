const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function login(config = {}) {
  const {
    table = 'users',
    identifier = 'email',
    password = 'password',
    token = 'jwt',
    secret = 'simpleapi-secret',
    dbName = 'json',
    select = ['_id', identifier, 'role']
  } = config;

  return async (req, res, next) => {
    const db = req.app.__context?.db?.get(dbName); // ✅ FIXED

    if (!db) {
      return res.status(500).json({ error: `Database "${dbName}" not available` });
    }

    const { [identifier]: idVal, [password]: passVal } = req.body || {};

    if (!idVal || !passVal) {
      return res.status(400).json({ error: `Missing ${identifier} or ${password}` });
    }

    try {
      const users = await db.find(table, {
        filter: {
          [identifier]: { op: '=', value: idVal }
        }
      });

      const user = users[0];
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(passVal, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userPayload = {};
      select.forEach(k => userPayload[k] = user[k]);

      let response = { user: userPayload };
      if (token === 'jwt') {
        response.token = jwt.sign(userPayload, secret, { expiresIn: '1d' });
      }

      return res.json(response);
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
  };
}

module.exports = login;
