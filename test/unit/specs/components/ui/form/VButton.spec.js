import { shallow, createLocalVue } from '@vue/test-utils';

import VButton from '@/components/ui/form/VButton.vue';

const localVue = createLocalVue();

describe('VButton', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VButton, { localVue });
  });

  it('should render props', () => {
    expect(wrapper.find('a').attributes().id).toBe('');
    expect(wrapper.contains('a.is-loading')).toBeFalsy();

    wrapper.setProps({
      id: 'some-id',
      loading: true,
    });

    expect(wrapper.find('a').attributes().id).toBe('some-id');
    expect(wrapper.contains('a.is-loading')).toBeTruthy();
  });

  it('should emit event if not disabled', () => {
    const button = wrapper.find('a');

    expect(button.attributes().disabled).toBeFalsy();

    button.trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();

    wrapper.setProps({ disabled: true });
    // FIXME when update test-utils
    // button.trigger('click');
    // expect(wrapper.emitted().click).toBeFalsy();
    expect(button.attributes().disabled).toBeTruthy();

    wrapper.setProps({ disabled: false });
    expect(button.attributes().disabled).toBeFalsy();

    button.trigger('click');
    expect(wrapper.emitted().click).toBeTruthy();

    expect(wrapper.emitted().click.length).toBe(2);
  });
});
