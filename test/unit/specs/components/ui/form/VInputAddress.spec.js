import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import web3 from 'web3';
import Vuex from 'vuex';

import VInputAddress from '@/components/ui/form/VInputAddress.vue';
let web3Instance = new web3('https://mainnet.infura.io/');
const localVue = createLocalVue();

localVue.use(VeeValidate);
localVue.use(Vuex);

describe('VInputAddress', () => {
  let wrapper;

  const options = {
    name: 'someName',
    disabled: 'disabled',
    required: 'required',
    placeholder: 'Some placeholder',
    ariaDescribedby: 'describe',
  };

  beforeEach(() => {
    let store = new Vuex.Store({
      state: {
        web3: {
          web3: web3Instance,
        },
      },
    });
    wrapper = shallow(VInputAddress, {
      store,
      localVue,
      slots: {
        addon: '<span>My Addon</span>',
      },
      propsData: options,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  it('should render props', () => {
    const camelToKebab = str =>
      str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);

    const input = wrapper.find('input');

    expect(wrapper.contains('label')).toBeFalsy();
    expect(input.element.value).toBeFalsy();
    expect(wrapper.contains('p')).toBeFalsy();

    wrapper.setProps({
      label: 'Some Label',
      help: 'help text',
    });

    expect(wrapper.find('label').text()).toBe('Some Label');

    wrapper.setProps({ error: 'Some error' });

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[camelToKebab(prop)]).toBe(options[prop]);
    });
  });

  it('should render slot', () => {
    expect(wrapper.vm.$slots.addon).toBeTruthy();
  });
});
