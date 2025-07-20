// db/mysql.js

const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'simpleapi'
});

function buildWhere(query) {
  const keys = Object.keys(query);
  const where = keys.map(k => `${k} = ?`).join(' AND ');
  const values = keys.map(k => query[k]);
  return { where, values };
}

module.exports = {
  async find(table, query) {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`SELECT * FROM ??`, [table]);
    conn.release();
    return rows;
  },

  async insert(table, item) {
    const conn = await pool.getConnection();
    const [result] = await conn.query(`INSERT INTO ?? SET ?`, [table, item]);
    conn.release();
    return { id: result.insertId, ...item };
  },

  async update(table, query, update) {
    const conn = await pool.getConnection();
    const { where, values } = buildWhere(query);
    const [result] = await conn.query(
      `UPDATE ?? SET ? WHERE ${where}`,
      [table, update, ...values]
    );
    conn.release();
    return { updated: result.affectedRows };
  },

  async remove(table, query) {
    const conn = await pool.getConnection();
    const { where, values } = buildWhere(query);
    const [result] = await conn.query(`DELETE FROM ?? WHERE ${where}`, [table, ...values]);
    conn.release();
    return { deleted: result.affectedRows };
  }
};
