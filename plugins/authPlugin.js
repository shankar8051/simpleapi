const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let users = []; // You can replace with real DB
let config = {
  secret: 'mysecret',
  expiresIn: '1h',
  refreshIn: '30d'
};

const auth = {
  guard: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
      const decoded = jwt.verify(token, config.secret);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.secret, { expiresIn: config.expiresIn });
    res.json({ token });
  },

  register: async (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), email, password: hashed };
    users.push(newUser);
    res.json({ message: 'Registered' });
  },

  refresh: (req, res) => {
    // optional: refresh token handling
    res.status(501).json({ error: 'Not implemented' });
  }
};

function install(context) {
  const { app, config: userConfig } = context;
  if (userConfig?.auth) Object.assign(config, userConfig.auth);

  // Register routes
  app.post('/login', auth.login);
  app.post('/register', auth.register);

  context.auth = auth; // so user can do: api.get(..., auth.guard)
}

module.exports = { install };
