import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VInput', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VInput, {
      localVue,
      slots: {
        addon: '<span>My Addon</span>',
      },
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      })
    });
  });

  it('should render props', () => {
    const camelToKebab = str => str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`)

    const input = wrapper.find('input');

    const options = {
      name: 'someName',
      disabled: 'disabled',
      required: 'required',
      placeholder: 'Some placeholder',
      autocomplete: 'new-password',
      ariaDescribedby: 'describe',
      autocomplete: 'new-password',
      testACamelCase: 'test camel case',
    }

    expect(wrapper.contains('label')).toBeFalsy();
    expect(input.attributes().type).toBe('text');
    expect(input.element.value).toBeFalsy();
    expect(wrapper.contains('p')).toBeFalsy();

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[camelToKebab(prop)]).toBeFalsy();
    })

    wrapper.setProps({
      type: 'email',
      value: 'some value',
      label: 'Some Label',
      error: 'Some error',
      ...options,
    });

    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(wrapper.find('p').text()).toBe('Some error');
    expect(input.element.value).toBe('some value');
    expect(input.attributes().type).toBe('email');

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[camelToKebab(prop)]).toBe(options[prop]);
    })
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
