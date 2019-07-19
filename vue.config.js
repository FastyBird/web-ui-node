const PreloadWebpackPlugin = require('preload-webpack-plugin')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')

module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },

  devServer: {
    proxy: {
      '/v1': {
        target: 'https://io.fastybird.com',
        secure: true,
        changeOrigin: true,
      },
      '/ws-exchange': {
        target: 'wss://io.fastybird.com/sockets',
        pathRewrite: {
          '^/ws-exchange': '',
        },
        secure: false,
        ws: true,
        changeOrigin: true,
      },
    },
  },

  css: {
    sourceMap: true,
  },

  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    /* svgRule.use('vue-svg-loader').loader('vue-svg-loader') */
    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },

  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 200000,
      },
    },
    plugins: [
      new PreloadWebpackPlugin({
        rel: 'prefetch',
      }),
      new SentryWebpackPlugin({
        include: '.',
        ignoreFile: '.sentrycliignore',
        ignore: ['node_modules', 'webpack.config.js'],
        configFile: 'sentry.properties',
      }),
    ],
  },
}
