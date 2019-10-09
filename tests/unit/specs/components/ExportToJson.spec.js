import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import UIComponents from '@endpass/ui';

import { v3, v3password } from 'fixtures/accounts';
import ExportToJson from '@/components/ExportToJson';
import { Wallet } from '@/class';
import setupI18n from '@/locales/i18nSetup';


const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);
localVue.use(UIComponents);

describe('ExportToJson', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            wallet: () => new Wallet(v3),
          },
        },
      },
    });
    wrapper = shallowMount(ExportToJson, {
      i18n,
      store,
      localVue,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ExportToJson');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    it('should correctly save v3 keystore to json', async () => {
      expect.assertions(1);

      wrapper.vm.saveJSON = jest.fn();

      await wrapper.vm.exportJSON(v3password);

      const v3FromFunc = JSON.parse(wrapper.vm.saveJSON.mock.calls[0]);

      expect(v3FromFunc).toEqual(v3);
    });
  });
});
