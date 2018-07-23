import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VInput', () => {
  let wrapper;

  const options = {
    name: 'someName',
    disabled: 'disabled',
    required: 'required',
    placeholder: 'Some placeholder',
    autocomplete: 'new-password',
    ariaDescribedby: 'describe',
    autocomplete: 'new-password',
  };

  beforeEach(() => {
    wrapper = shallow(VInput, {
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
    expect(input.attributes().type).toBe('text');
    expect(input.element.value).toBeFalsy();
    expect(wrapper.contains('p')).toBeFalsy();

    wrapper.setProps({
      type: 'email',
      value: 'some value',
      label: 'Some Label',
      help: 'help text',
    });

    expect(wrapper.find('p.help').text()).toBe('help text');
    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(input.element.value).toBe('some value');
    expect(input.attributes().type).toBe('email');

    wrapper.setProps({ error: 'Some error' });
    expect(wrapper.find('p.help').text()).toBe('Some error');

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[camelToKebab(prop)]).toBe(options[prop]);
    });
  });

  it('should emit event', () => {
    wrapper.find('input').trigger('input');
    wrapper.find('input').trigger('blur');

    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().blur).toBeTruthy();
  });

  it('should render slot', () => {
    expect(wrapper.vm.$slots.addon).toBeTruthy();
  });
});
