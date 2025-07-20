// plugins/auth/index.js

const register = require('./register');
const login = require('./login');
const guard = require('./guard');

function install(app) {
  // Optional: register default routes
  // app.post('/register', register(...));
  // app.post('/login', login(...));
  // But we let users mount manually

  app.__auth = { register, login, guard }; // available via context if needed
}

module.exports = { install, register, login, guard };
