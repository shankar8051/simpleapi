# simpleAPI

A pluggable, schema-aware, multi-DB, multi-channel (HTTP/MQTT/WS) minimal API engine for IoT and beyond.

## ✅ Features
- Schema-based or schema-less API creation
- Dynamic route definition: `simpleAPI.post('/route', middleware, db, schema)`
- Multi-DB: JSON (default), SQLite, MongoDB, MySQL
- Multi-channel: HTTP (default), MQTT, WebSocket
- Plugin system and tenant support
- Advanced GET support: filters, calculations, aggregations, pagination
- Express-compatible middleware

## 🚀 Quick Start

```bash
npm install
node examples/server.js
```

## 🧱 Example

```js
const simpleAPI = require('simpleAPI');

const api = simpleAPI({
  channels: ['http', 'mqtt'],
  plugins: ['examplePlugin']
});

api.post('/sensor', 'json', {
  deviceId: 'required,text',
  temperature: 'num'
});

api.get('/sensor', 'json');
```

## 📁 Folder Structure
```
simpleAPI/
├── core/               # Core logic (router, validator, parser, channel)
├── db/                 # DB adapters
├── plugins/            # Plugin system
├── utils/              # Shared utils
├── tenants/            # Optional tenant-specific configs
├── examples/           # Demo server
```

## 📦 Supported Channels
- HTTP (default)
- MQTT (via `mqtt` package)
- WebSocket (via `ws` package)

## 🔌 Supported Databases
- JSON (no setup needed)
- SQLite (`sqlite3`)
- MongoDB (`mongodb`)
- MySQL (`mysql2`)

---
MIT License
