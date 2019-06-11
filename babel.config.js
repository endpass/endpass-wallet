module.exports = {
  presets: ['@vue/app'],
  plugins: [
    ['lodash'],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
