import Vuex from 'vuex';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import SettingsPage from '@/components/pages/Settings.vue';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('SettingsPage', () => {
  let wrapper;
  let actions;
  let store;
  let options;

  beforeEach(() => {
    actions = {
      updateSettings: jest.fn(),
    };

    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          actions,
        },
      },
    });

    options = {
      store,
      localVue,
      computed: {
        settings: () => ({
          fiatCurrency: 'USD',
        }),
        availableCurrencies: () => ['USD', 'AUD', 'BRL'],
      },
    };

    wrapper = shallow(SettingsPage, options);
  });

  it('should set data from props correctly', () => {
    expect(wrapper.vm.$data.newSettings).toEqual(wrapper.vm.settings);
  });

  it('should call update action when click', () => {
    wrapper = mount(SettingsPage, options);

    expect(wrapper.vm.isFormValid).toBeFalsy();

    const newSettings = {
      fiatCurrency: 'AUD',
    };

    wrapper.setData({ newSettings });

    expect(wrapper.vm.isFormValid).toBeTruthy();

    wrapper.find('a#save-button').trigger('click');

    expect(actions.updateSettings.mock.calls).toHaveLength(1);
    expect(actions.updateSettings).toBeCalledWith(
      expect.any(Object),
      newSettings,
      undefined
    );
  });
});
