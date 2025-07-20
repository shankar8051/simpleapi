function load(context, plugins = []) {
  plugins.forEach((plugin, index) => {
    try {
      if (typeof plugin === 'string') {
        const loaded = require(`./${plugin}`);
        if (typeof loaded.install === 'function') {
          loaded.install(context);
        } else {
          console.warn(`⚠️ Plugin '${plugin}' does not export an install() function`);
        }
      } else if (typeof plugin.install === 'function') {
        plugin.install(context);
      } else {
        console.warn(`⚠️ Plugin at index ${index} is not valid`);
      }
    } catch (err) {
      console.warn(`⚠️ Failed to load plugin '${plugin}':`, err.message);
    }
  });
}

module.exports = { load };
