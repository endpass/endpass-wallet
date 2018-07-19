import Vuex from 'vuex';
import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';

import SettingsPage from '@/components/pages/Settings.vue';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(Notifications);

describe('SettingsPage', () => {
  const actions = {
    updateSettings: jest.fn(),
  };
  const storeOptions = {
    modules: {
      accounts: {
        namespaced: true,
        state: {
          settings: {
            fiatCurrency: 'USD',
          },
          availableCurrencies: ['USD', 'AUD', 'BRL'],
        },
        actions,
      },
    },
  };
  let wrapper;
  let store;
  let options;

  beforeEach(() => {
    store = new Vuex.Store(storeOptions);

    options = {
      store,
      localVue,
      stubs: generateStubs(SettingsPage),
    };

    wrapper = shallow(SettingsPage, options);
  });

  afterEach(() => {
    actions.updateSettings.mockClear();
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  it('should set data from props correctly', () => {
    expect(wrapper.vm.$data.newSettings).toEqual(wrapper.vm.settings);
  });

  it('should call update action', () => {
    const newSettings = {
      fiatCurrency: 'AUD',
    };

    wrapper.setData({ newSettings });
    wrapper.vm.updateSettings(newSettings);

    expect(actions.updateSettings.mock.calls).toHaveLength(1);
    expect(actions.updateSettings).toBeCalledWith(
      expect.any(Object),
      newSettings,
      undefined,
    );
  });
});
