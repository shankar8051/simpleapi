const jwt = require('jsonwebtoken');

function guard(config = {}) {
  const {
    token = 'jwt',
    secret = 'simpleapi-secret',
    header = 'authorization',
    roles = null // e.g., ['admin', 'moderator']
  } = config;

  return (req, res, next) => {
    if (token !== 'jwt') return next(); // No token check if disabled

    const authHeader = req.headers[header.toLowerCase()];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const bearer = authHeader.split(' ');
    const tokenValue = bearer.length === 2 ? bearer[1] : bearer[0];

    jwt.verify(tokenValue, secret, (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });

      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      req.user = decoded;
      next();
    });
  };
}

module.exports = guard;
