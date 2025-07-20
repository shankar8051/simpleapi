// db/sqlite.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'data.sqlite');
const db = new sqlite3.Database(DB_PATH);

function ensureTable(table, sample = {}) {
  const cols = Object.keys(sample).map(k => `${k} TEXT`).join(', ');
  db.run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${cols})`);
}

module.exports = {
  async find(table, query) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  async insert(table, item) {
    ensureTable(table, item);
    const keys = Object.keys(item);
    const placeholders = keys.map(() => '?').join(',');
    const values = keys.map(k => item[k]);
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,
        values,
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...item });
        }
      );
    });
  },

  async update(table, query, update) {
    const setStr = Object.keys(update).map(k => `${k} = ?`).join(', ');
    const whereStr = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
    const values = [...Object.values(update), ...Object.values(query)];
    return new Promise((resolve, reject) => {
      db.run(`UPDATE ${table} SET ${setStr} WHERE ${whereStr}`, values, function (err) {
        if (err) reject(err);
        else resolve({ updated: this.changes });
      });
    });
  },

  async remove(table, query) {
    const whereStr = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(query);
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${table} WHERE ${whereStr}`, values, function (err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }
};
