const utils = require('@endpass/utils/build');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getEnv = require('./env/getEnv');

const { NODE_ENV, LOCAL_MODE } = process.env;
const ENV = getEnv(NODE_ENV, LOCAL_MODE);
const gitCommitHash = utils.getCommitHash();
const { mode } = process.VUE_CLI_SERVICE;

console.log('ENV', ENV);

module.exports = {
  lintOnSave: false,

  chainWebpack: config => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('svg-inline-loader').loader('svg-inline-loader');
  },

  css: {
    loaderOptions: {
      sass: {
        data: `@import "./src/css/_settings.scss";`,
      },
    },
  },

  configureWebpack: () => {
    const config = {
      plugins: [
        new webpack.DefinePlugin({
          ENV: JSON.stringify(ENV),
          GIT_COMMIT_HASH: JSON.stringify(gitCommitHash),
          'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
        new HtmlWebpackPlugin({
          filename: './index.html',
          template: './public/index.html',
          inject: true,
          chunks: ['chunk-vendors', 'rollbar', 'app'],
          chunksSortMode: 'manual',
          meta: {
            build: gitCommitHash,
          },
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
          },
        }),
      ],
    };

    if (mode === 'production') {
      config.entry = {
        rollbar: './public/rollbar.js',
      };
    }

    return config;
  },

  devServer: {
    proxy: {
      [ENV.tokenInfoAPIUrl]: {
        target: 'https://tokeninfo-dev.endpass.com',
        pathRewrite: {
          [ENV.tokenInfoAPIUrl]: '/api/v1',
        },
        changeOrigin: true,
      },
      [ENV.cryptoDataAPIUrl]: {
        target: 'https://cryptodata-dev.endpass.com',
        pathRewrite: {
          [ENV.cryptoDataAPIUrl]: '/api/v1.1',
        },
        changeOrigin: true,
      },
      '^/https://': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
      },
    },
  },
};
