jest.mock('@/locales/i18n', () => {
  const Vue = require('vue');
  const VueI18n = require('vue-i18n');
  Vue.use(VueI18n);
  const en = require('@/locales/i18n.en.json');
  return new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en,
    },
  });
});
