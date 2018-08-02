import { mount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VPassword from '@/components/ui/form/VPassword.vue';
import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VPassword', () => {
  let wrapper;
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
  });

  it('should contain an input element', () => {
    expect(wrapper.contains('input')).toBe(true);
    let input = wrapper.find(VInput);

    expect(input.props().name).toBe('someName');
    expect(input.props().autocomplete).toBe('current-password');
  });

  it('should toggle input type', () => {
    let input = wrapper.find(VInput);
    let inputEl = wrapper.find('input');

    expect(wrapper.vm.inputType).toBe('password');
    expect(input.props().type).toBe('password');
    expect(inputEl.attributes().type).toBe('password');

    wrapper.setData({ isVisible: true });
    expect(wrapper.vm.inputType).toBe('text');
    expect(input.props().type).toBe('text');
    expect(inputEl.attributes().type).toBe('text');
  });

  it('should emit event', () => {
    wrapper.find('input').trigger('input');
    wrapper.find('input').trigger('blur');

    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().blur).toBeTruthy();
  });
});
