import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VInput', () => {
  let wrapper;

  const attrs = {
    type: 'text',
    name: 'someName',
    'aria-described-by': 'describe',
    placeholder: 'Some placeholder',
    autocomplete: 'new-password',
  };

  beforeEach(() => {
    wrapper = shallow(VInput, {
      localVue,
      slots: {
        addon: '<span>My Addon</span>',
      },
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      attrs,
    });
  });

  it('should render props', () => {
    const input = wrapper.find('input');

    expect(wrapper.contains('label')).toBeFalsy();
    expect(input.attributes().type).toBe('text');
    expect(input.element.value).toBeFalsy();
    expect(wrapper.contains('p')).toBeFalsy();

    wrapper.setProps({
      value: 'some value',
      label: 'Some Label',
      help: 'help text',
    });

    expect(wrapper.find('p.help').text()).toBe('help text');
    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(input.element.value).toBe('some value');
    expect(input.attributes().type).toBe('text');

    wrapper.setProps({ error: 'Some error' });
    expect(wrapper.find('p.help').text()).toBe('Some error');

    Object.keys(attrs).forEach(attr => {
      expect(input.attributes()[attr]).toBe(attrs[attr]);
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
