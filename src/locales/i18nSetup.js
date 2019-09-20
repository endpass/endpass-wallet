import VueI18n from 'vue-i18n';

import { LOCALES } from '@/constants';

export default function setupI18n(Vue) {
  Vue.use(VueI18n);
  function loadBasicMessages() {
    const locales = require.context('./', true, /[A-Za-z0-9-_,\s]+\.json$/i);
    const messages = {};
    locales.keys().forEach(key => {
      const matched = key.match(/i18n.([A-Za-z0-9-_]+)\./i);
      if (matched && matched.length > 1) {
        const locale = matched[1];
        messages[locale] = locales(key);
      }
    });
    return messages;
  }

  function getPropesedLocale() {
    const proposedLocale =
      localStorage.getItem('locale') ||
      ((navigator.language && navigator.language.slice(0, 2)) ||
        (navigator.userLanguage && navigator.userLanguage.slice(0, 2)));
    return LOCALES.includes(proposedLocale) ? proposedLocale : null;
  }

  return new VueI18n({
    locale: getPropesedLocale() || ENV.VUE_APP_I18N_LOCALE || 'en',
    fallbackLocale: ENV.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
    messages: loadBasicMessages(),
  });
}
