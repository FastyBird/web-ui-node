module.exports = {
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
  ],
  presets: [
    process.env.VUE_PLATFORM === 'web' ? '@vue/app' : {},
    ['@babel/env', { targets: { esmodules: true } }],
  ],
}
