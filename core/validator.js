// core/validator.js

function validate(data, schema = {}) {
  for (const key in schema) {
    const rules = schema[key].split(',').map(r => r.trim());

    for (const rule of rules) {
      const value = data[key];

      if (rule === 'required' && (value === undefined || value === '')) {
        return `${key} is required`;
      }

      if (rule === 'text' && typeof value !== 'string') {
        return `${key} must be a string`;
      }

      if (rule === 'num' && typeof value !== 'number') {
        return `${key} must be a number`;
      }

      if (rule === 'unique') {
        // Note: actual uniqueness should be checked at the DB level.
        // Here it's only a flag passed to DB engine.
      }
    }
  }
  return null; // valid
}

module.exports = {
  validate
};
