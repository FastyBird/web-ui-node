module.exports = {
  locales: [
    {
      code: 'en',
      iso: 'en-US',
      name: 'English',
      file: 'en.js',
    },
  ],
  defaultLocale: 'en',
  seo: false,
  lazy: true,
  detectBrowserLanguage: {
    cookieKey: 'redirected',
    useCookie: true,
  },
  langDir: 'locales/',
  vueI18n: {
    fallbackLocale: 'en',
    silentTranslationWarn: false,
  },
}
