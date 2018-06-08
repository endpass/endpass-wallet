import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

describe('VInput', () => {
  let wrapper;

  beforeEach(() => {
    const v = new VeeValidate.Validator();

    wrapper = shallow(VInput, {
      localVue,
      slots: {
        addon: '<span>My Addon</span>',
      },
      provide: () => ({
        $validator: v,
      })
    });
  });

  it('should render props', () => {
    const input = wrapper.find('input');

    const options = {
      name: 'someName',
      disabled: 'disabled',
      required: 'required',
      placeholder: 'Some placeholder',
      autocomplete: 'new-password',
    }

    expect(wrapper.contains('label')).toBeFalsy();
    expect(input.attributes().type).toBe('text');
    expect(input.attributes().value).toBeFalsy();
    expect(input.attributes()['aria-describedby']).toBeFalsy();

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[prop]).toBeFalsy();
    })

    expect(wrapper.contains('p')).toBeFalsy();

    wrapper.setProps({
      type: 'email',
      value: 'some value',
      label: 'Some Label',
      error: 'Some error',
      ariaDescribedby: 'describe',
      ...options,
    });

    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(wrapper.find('p').text()).toBe('Some error');
    expect(input.element.value).toBe('some value');    
    expect(input.attributes().type).toBe('email');
    expect(input.attributes()['aria-describedby']).toBe('describe');

    Object.keys(options).forEach(prop => {
      expect(input.attributes()[prop]).toBe(options[prop]);
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
