import { shallow, createLocalVue, mount } from '@vue/test-utils';

import VInput from '@/components/ui/form/VInput.vue';

const localVue = createLocalVue();

describe('VInput', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VInput, {
      localVue,
      slots: {
        addon: '<span>My Addon</span>',
      },
    });
  });

  it('should render props', async () => {
    const input = wrapper.find('input');

    expect(wrapper.contains('label')).toBeFalsy();
    expect(input.attributes().value).toBeFalsy();
    expect(input.attributes().type).toBe('text');
    expect(input.attributes().name).toBeFalsy();
    expect(input.attributes().placeholder).toBeFalsy();
    expect(input.attributes().disabled).toBeFalsy();
    expect(input.attributes().required).toBeFalsy();
    expect(input.attributes()['aria-describedby']).toBeFalsy();
    expect(wrapper.contains('p')).toBeFalsy();

    wrapper.setProps({
      type: 'email',
      value: 'some value',
      name: 'someName',
      label: 'Some Label',
      disabled: true,
      required: true,
      placeholder: 'Some placeholder',
      describe: 'describe',
      error: 'Some error',
    });

    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(input.element.value).toBe('some value');
    expect(input.attributes().type).toBe('email');
    expect(input.attributes().name).toBe('someName');
    expect(input.attributes().placeholder).toBe('Some placeholder');
    expect(input.attributes().disabled).toBeTruthy();
    expect(input.attributes().required).toBeTruthy();
    expect(input.attributes()['aria-describedby']).toBe('describe');
    expect(wrapper.find('p').text()).toBe('Some error');

    input.trigger('input');
    input.trigger('blur');

    expect(wrapper.emitted().input).toBeTruthy();
    expect(wrapper.emitted().blur).toBeTruthy();
  });

  it('should render slot', async () => {
    expect(wrapper.vm.$slots.addon).toBeTruthy();
  });
});
