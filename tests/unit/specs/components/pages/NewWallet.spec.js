import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';

import NewWallet from '@/components/pages/NewWallet';
import validation from '@/validation';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Notifications);
localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);
localVue.use(VueRouter);

describe('NewWallet page', () => {
  let wrapper;
  let router;
  const actions = {
    createNewWallet: jest.fn(),
    'accounts/backupSeed': jest.fn(),
  };

  const createWrapper = () => {
    const store = new Vuex.Store({
      modules: {
        accounts: {
          state: {
            hdWallet: null,
          },
          namespaced: true,
          actions,
        },
      },
    });
    router = new VueRouter();
    return shallowMount(NewWallet, {
      localVue,
      store,
      router,
      i18n,
      mocks: {
        $ga: {
          event: () => {},
        },
      },
    });
  };

  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe('createWallet', () => {
    it('should create wallet', async () => {
      expect.assertions(3);

      actions.createNewWallet = jest.fn().mockResolvedValueOnce();
      wrapper = createWrapper();

      expect(wrapper.find('[data-test=create-successful]').exists()).toBe(
        false,
      );

      await global.flushPromises();

      expect(actions.createNewWallet).toBeCalledTimes(1);
      expect(wrapper.find('[data-test=create-successful]').exists()).toBe(true);
    });

    it('should not create wallet', async () => {
      expect.assertions(2);

      actions.createNewWallet = jest.fn().mockRejectedValueOnce();
      wrapper = createWrapper();

      await global.flushPromises();

      expect(actions.createNewWallet).toBeCalledTimes(1);
      expect(wrapper.find('[data-test=create-in-progress]').exists()).toBe(
        true,
      );
    });
  });
});
