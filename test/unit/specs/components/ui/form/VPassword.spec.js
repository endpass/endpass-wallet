import { mount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VPassword from '@/components/ui/form/VPassword.vue';
import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VPassword', () => {
  let wrapper;
  let input;
  let inputEl;
  const attrs = {
    name: 'someName',
  };

  beforeEach(() => {
    wrapper = mount(VPassword, {
      localVue,
      attrs,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
    input = wrapper.find(VInput);
    inputEl = wrapper.find('input');
  });

  it('should contain an input element', () => {
    expect(input.attributes().name).toBeFalsy();
    expect(inputEl.attributes().name).toBe('someName');
    expect(inputEl.attributes().autocomplete).toBe('current-password');
  });

  it('should toggle input type', () => {
    expect(wrapper.vm.inputType).toBe('password');
    expect(inputEl.attributes().type).toBe('password');

    wrapper.setData({ isVisible: true });
    expect(wrapper.vm.inputType).toBe('text');
    expect(input.attributes().type).toBeFalsy();
    expect(inputEl.attributes().type).toBe('text');
  });

  it('should emit event', () => {
    wrapper.find('input').trigger('input');
    wrapper.find('input').trigger('blur');

    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().blur).toBeTruthy();
  });
});
