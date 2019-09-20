jest.mock('@/locales/i18nSetup', () => {
  const VueI18n = require('vue-i18n');

  return function setupI18n(Vue) {
    Vue.use(VueI18n);
    const en = require('@/locales/i18n.en.json');
    return new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en,
      },
    });
  };
});
