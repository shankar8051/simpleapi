function init(context) {
  const { app, channels = ['http'], mqttOptions = {} } = context;

  // HTTP चैनलमा app.listen हटाइयो ताकि server.js बाट मात्र सुरु होस्
  // (server.js मा HTTP server सुरु गर्ने)

  if (channels.includes('mqtt')) {
    try {
      const mqtt = require('mqtt');
      const client = mqtt.connect(mqttOptions.host || 'mqtt://localhost:1883', mqttOptions.options || {});

      client.on('connect', () => {
        console.log('📡 MQTT connected');
        client.subscribe('#', () => console.log('📥 Subscribed to all MQTT topics'));
      });

      client.on('message', async (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`🔹 MQTT [${topic}]:`, data);

          if (topic.startsWith('sensor/')) {
            const parts = topic.split('/');
            const table = parts[1] || 'default';

            const dbName = context.config.db || 'json';
            const db = context.db.get(dbName);

            if (db && typeof db.insert === 'function') {
              await db.insert(table, data);
              console.log(`✅ Inserted data to ${table} collection in DB ${dbName}`);
            } else {
              console.warn(`⚠️ DB not available or insert method missing for DB: ${dbName}`);
            }
          }
        } catch (e) {
          console.warn('⚠️ MQTT message parse error:', message.toString());
        }
      });

      context.mqttClient = client;
    } catch (err) {
      console.warn('⚠️ MQTT not available:', err.message);
    }
  }

  if (channels.includes('ws')) {
    try {
      const { Server } = require('ws');
      const wss = new Server({ port: 8080 });

      wss.on('connection', (ws) => {
        console.log('🔌 WS client connected');
        ws.on('message', (msg) => {
          console.log('🔹 WS message:', msg);
        });
      });

      context.wsServer = wss;
    } catch (err) {
      console.warn('⚠️ WS not available:', err.message);
    }
  }
}

module.exports = { init };
