// core/queryParser.js

function parse(query = {}, schema = {}, options = {}) {
  const parsed = {
    filter: {},
    calc: [],
    agg: [],
    sort: {},
    limit: null,
    offset: null
  };

  // Basic filters (e.g., filter=temperature>20)
  if (query.filter) {
    const filters = query.filter.split(',');
    for (const cond of filters) {
      const match = cond.match(/(\w+)([<>=!]+)(.+)/);
      if (match) {
        const [, field, op, val] = match;
        parsed.filter[field] = { op, value: parseValue(val) };
      }
    }
  }

  // Calculations (e.g., calc=price*qty)
  if (query.calc) {
    parsed.calc = query.calc.split(',').map(e => e.trim());
  }

  // Aggregations (e.g., agg=sum(temp),avg(humidity))
  if (query.agg) {
    parsed.agg = query.agg.split(',').map(e => e.trim());
  }

  // Sorting (e.g., sort=field:asc)
  if (query.sort) {
    query.sort.split(',').forEach(s => {
      const [key, dir] = s.split(':');
      parsed.sort[key.trim()] = dir?.trim() || 'asc';
    });
  }

  // Pagination
  parsed.limit = parseInt(query.limit || options.limit || 100);
  const page = parseInt(query.page || 1);
  parsed.offset = (page - 1) * parsed.limit;

  return parsed;
}

function parseValue(val) {
  if (!isNaN(val)) return Number(val);
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}

module.exports = { parse };
