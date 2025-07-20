const jwt = require('jsonwebtoken');

function refresh(config = {}) {
  const {
    secret = 'simpleapi-secret',
    expiresIn = '15m',
    refreshSecret = 'simpleapi-refresh',
    refreshTokenKey = 'refreshToken',
    outputKey = 'token'
  } = config;

  return async (req, res) => {
    const token = req.body[refreshTokenKey];
    if (!token) {
      return res.status(400).json({ error: 'Missing refresh token' });
    }

    try {
      const decoded = jwt.verify(token, refreshSecret);

      // Strip out `iat`, `exp` etc. before re-signing
      const { iat, exp, ...payload } = decoded;
      const newToken = jwt.sign(payload, secret, { expiresIn });

      return res.json({ [outputKey]: newToken });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  };
}

module.exports = refresh;
