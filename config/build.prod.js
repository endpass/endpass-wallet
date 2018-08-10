'use strict';
module.exports = {
  entry: {
    app: './src/main.js',
    rollbar: './static/rollbar.js',
  },
  chunks: ['manifest', 'vendor', 'rollbar', 'app'],
};
