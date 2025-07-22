const express = require('express');
const { load } = require('./plugins');
const router = require('./core/router');
const dbSelector = require('./db').get;
const channelManager = require('./core/channelManager');

function simpleAPI(config = {}) {
  const app = config.app || express(); // app config बाट नआए नयाँ बनाउने
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const selectedDbName = config.db || (config.config?.db) || 'json';

  // DB instance ल्याउने
  const dbInstance = dbSelector(selectedDbName);

  const dbMap = {
    [selectedDbName]: dbInstance
  };

  const db = {
    get: (name) => {
      const result = dbMap[name] || null;
      console.log(`simpleAPI: get DB instance for '${name}':`, result ? 'FOUND' : 'NOT FOUND');
      return result;
    }
  };

  const context = {
    app,
    db,
    config,
    channels: config.channels || ['http'],
    mqttOptions: config.mqttOptions || {}
  };

  app.__context = context;

  channelManager.init(context);

  if (config.plugins) {
    load(context, config.plugins);
  }

  const wrappedRouter = router(context);

  return {
    post: (...args) => wrappedRouter.post(...args),
    get: (...args) => wrappedRouter.get(...args),
    put: (...args) => wrappedRouter.put(...args),
    delete: (...args) => wrappedRouter.delete(...args),
    app
  };
}

module.exports = simpleAPI;
