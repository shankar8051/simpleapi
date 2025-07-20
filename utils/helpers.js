// utils/helpers.js

function isValidType(value, type) {
  if (type === 'text') return typeof value === 'string';
  if (type === 'num') return typeof value === 'number';
  if (type === 'bool') return typeof value === 'boolean';
  return true;
}

module.exports = {
  isValidType
};
