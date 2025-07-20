// db/mongo.js

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db('simpleapi');
  }
  return db;
}

// Helper to convert simpleAPI filter format to MongoDB filter
function buildMongoFilter(filter = {}) {
  const mongoFilter = {};
  for (const key in filter) {
    const condition = filter[key];
    if (typeof condition === 'object' && 'op' in condition && 'value' in condition) {
      switch (condition.op) {
        case '=':
          mongoFilter[key] = condition.value;
          break;
        case '>':
          mongoFilter[key] = { $gt: condition.value };
          break;
        case '<':
          mongoFilter[key] = { $lt: condition.value };
          break;
        case '!=':
          mongoFilter[key] = { $ne: condition.value };
          break;
        case '>=':
          mongoFilter[key] = { $gte: condition.value };
          break;
        case '<=':
          mongoFilter[key] = { $lte: condition.value };
          break;
        default:
          mongoFilter[key] = condition.value;
      }
    } else {
      mongoFilter[key] = condition;
    }
  }
  return mongoFilter;
}

module.exports = {
  async find(table, query) {
    const dbo = await connect();
    const rawFilter = query?.filter || {};
    const mongoFilter = buildMongoFilter(rawFilter);
    return dbo.collection(table).find(mongoFilter).toArray();
  },

  async insert(table, item) {
    const dbo = await connect();
    const result = await dbo.collection(table).insertOne(item);
    if (result.insertedId) {
      const inserted = await dbo.collection(table).findOne({ _id: result.insertedId });
      return inserted;
    }
    return item;
  },

  async update(table, query, update) {
    const dbo = await connect();
    const filter = buildMongoFilter(query);
    const result = await dbo.collection(table).updateMany(filter, { $set: update });
    return { updated: result.modifiedCount };
  },

  async remove(table, query) {
    const dbo = await connect();
    const filter = buildMongoFilter(query);
    const result = await dbo.collection(table).deleteMany(filter);
    return { deleted: result.deletedCount };
  }
};
