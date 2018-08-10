'use strict';

module.exports = {
  entry: {
    app: './src/main.js',
  },
  chunks: ['manifest', 'vendor', 'app'],
};
