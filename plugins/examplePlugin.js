// plugins/examplePlugin.js
module.exports = {
  install(context) {
    const app = context.app;
    app.use((req, res, next) => {
      console.log(`[PLUGIN] ${req.method} ${req.url}`);
      next();
    });
  }
};
