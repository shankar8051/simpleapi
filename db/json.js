const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

function getFile(table) {
  return path.join(DB_DIR, `${table}.json`);
}

function read(table) {
  const file = getFile(table);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function write(table, data) {
  const file = getFile(table);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  async find(table, query = {}) {
    const data = read(table);
    if (!query.filter) return data;

    const filters = query.filter;

    const result = data.filter(item => {
      return Object.entries(filters).every(([key, condition]) => {
        const val = item[key];
        const { op, value } = condition;
        switch (op) {
          case '=': return val == value;
          case '!=': return val != value;
          case '>': return val > value;
          case '<': return val < value;
          case '>=': return val >= value;
          case '<=': return val <= value;
          default: return false;
        }
      });
    });

    return result;
  },

  async insert(table, item) {
    const data = read(table);
    data.push(item);
    write(table, data);
    return item;
  },

  async update(table, query, update) {
    let data = read(table);
    const keys = Object.keys(query);
    data = data.map(d => {
      if (keys.every(k => d[k] == query[k])) {
        return { ...d, ...update };
      }
      return d;
    });
    write(table, data);
    return { updated: true };
  },

  async remove(table, query) {
    const data = read(table);
    const keys = Object.keys(query);
    const filtered = data.filter(d => !keys.every(k => d[k] == query[k]));
    write(table, filtered);
    return { deleted: data.length - filtered.length };
  }
};
