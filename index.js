const express = require('express');
const { load } = require('./plugins');
const router = require('./core/router');
const dbSelector = require('./db').get;
const channelManager = require('./core/channelManager');

function simpleAPI(config = {}) {
  const app = express();
  app.use(express.json());

  // DB name select गर्नुहोस् config.db बाट नभए 'json' default
  const selectedDbName = config.db || 'json';

  // DB map create गर्नुहोस्
  const dbMap = {
    [selectedDbName]: dbSelector(selectedDbName)
  };

  // DB interface जसले dbMap बाट db instance ल्याउँछ
  const db = {
    get: (name) => {
      const result = dbMap[name] || null;
      console.log(`simpleAPI: get DB instance for '${name}':`, result ? 'FOUND' : 'NOT FOUND');
      return result;
    }
  };

  // Context मा सबै राख्नुहोस्
  const context = {
    app,
    db,
    config,
    channels: config.channels || ['http'],    // default HTTP channel
    mqttOptions: config.mqttOptions || {}
  };

  // app मा context attach गरेर future debugging सजिलो
  app.__context = context;

  // ChannelManager init call (HTTP, MQTT, WS सब handled भित्रै)
  channelManager.init(context);

  // Plugins load गर्नुहोस् (जस्तै auth)
  if (config.plugins) {
    load(context, config.plugins);
  }

  // Router wrap गर्नुहोस् र context pass गर्नुहोस्
  const wrappedRouter = router(context);

  // API interface फर्काउनुहोस्
  return {
    post: (...args) => wrappedRouter.post(...args),
    get: (...args) => wrappedRouter.get(...args),
    put: (...args) => wrappedRouter.put(...args),
    delete: (...args) => wrappedRouter.delete(...args),
    app
  };
}

module.exports = simpleAPI;
