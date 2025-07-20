// utils/logger.js

function log(...args) {
  console.log('📝', ...args);
}

function warn(...args) {
  console.warn('⚠️', ...args);
}

function error(...args) {
  console.error('❌', ...args);
}

module.exports = { log, warn, error };
