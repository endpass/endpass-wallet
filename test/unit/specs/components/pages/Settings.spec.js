import Vuex from 'vuex';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import SettingsPage from '@/components/pages/Settings.vue';
import Notifications from 'vue-notification'
import VeeValidate from 'vee-validate';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(Notifications)

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

  it('should call update action when click',async (done) => {
    wrapper = mount(SettingsPage, options);

    const newSettings = {
      fiatCurrency: 'AUD',
    };

    wrapper.setData({ newSettings });

    wrapper.find('a#save-button').trigger('click');

    await new Promise((res, rej) => {setTimeout(()=> {res()}, 20)})
    expect(actions.updateSettings.mock.calls).toHaveLength(1);
    expect(actions.updateSettings).toBeCalledWith(
      expect.any(Object),
      newSettings,
      undefined
    );
    done();
  });
});
