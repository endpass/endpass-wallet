import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';

import NewWallet from '@/components/pages/NewWallet.vue';
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
  let actions;
  describe('methods', () => {
    beforeAll(() => {
      jest.clearAllMocks();
      actions = {
        createNewWallet: jest.fn(),
        'accounts/backupSeed': jest.fn(),
      };
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
      wrapper = shallowMount(NewWallet, {
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
    });
    describe('createWallet', () => {
      it('should call correct action and display result', async () => {
        expect.assertions(2);

        const testSeed = 'kek';
        actions.createNewWallet.mockResolvedValueOnce(testSeed);
        await wrapper.vm.createWallet();

        expect(actions.createNewWallet).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.key).toBe(testSeed);
      });
    });
  });
});
