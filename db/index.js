const jsonDB = require('./json');
const sqliteDB = require('./sqlite');
const mongoDB = require('./mongo');
const mysqlDB = require('./mysql');

const dbMap = {
  json: jsonDB,
  sqlite: sqliteDB,
  mongo: mongoDB,
  mysql: mysqlDB
};

function get(dbName = 'json') {
  return dbMap[dbName] || jsonDB;
}

function getTable(dbName, route) {
  return route.replace(/^\//, ''); // e.g. '/users' => 'users'
}

module.exports = {
  get,
  getTable
};
