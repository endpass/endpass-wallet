const buildUtils = require('@endpass/utils/build');
const objectUtils = require('@endpass/utils/objects');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const gitCommitHash = buildUtils.getCommitHash();
const { mode } = process.VUE_CLI_SERVICE;

const ENV = objectUtils.parseObjectProperties(process.env, 'VUE_APP');
console.log('ENV', ENV);

module.exports = {
  lintOnSave: false,

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('svg-inline-loader').loader('svg-inline-loader');
  },

  css: {
    loaderOptions: {
      sass: {
        data: '@import "./src/css/_settings.scss";',
      },
    },
  },

  configureWebpack: () => {
    const config = {
      plugins: [
        new webpack.DefinePlugin({
          GIT_COMMIT_HASH: JSON.stringify(gitCommitHash),
          ENV: JSON.stringify(ENV),
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
      [process.env.VUE_APP_TOKEN_INFO_API_URL]: {
        target: 'https://tokeninfo-dev.endpass.com',
        pathRewrite: {
          [process.env.VUE_APP_TOKEN_INFO_API_URL]: '/api/v1',
        },
        changeOrigin: true,
      },
      [process.env.VUE_APP_CRYPTODATA_API_URL]: {
        target: 'https://cryptodata-dev.endpass.com',
        pathRewrite: {
          [process.env.VUE_APP_CRYPTODATA_API_URL]: '/api/v1.1',
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
