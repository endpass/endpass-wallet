import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VButton from '@/components/ui/form/VButton.vue';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VButton', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VButton, {
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  it('should render props', () => {
    const button = wrapper.find('button');

    expect(button.attributes().id).toBeFalsy();
    expect(button.classes()).not.toContain('is-loading');
    expect(wrapper.contains('a.some-class.some-class-1')).toBeFalsy();

    wrapper.setProps({
      id: 'some-id',
      loading: true,
      className: 'some-class some-class-1',
    });

    expect(button.attributes().id).toBe('some-id');
    expect(button.classes()).toContain('is-loading');
    expect(wrapper.contains('button.some-class.some-class-1')).toBeTruthy();
  });

  it('should emit event if not disabled', async done => {
    const button = wrapper.find('button');

    expect(button.attributes().disabled).toBeFalsy();

    button.trigger('click');
    await new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, 40);
    });
    expect(wrapper.emitted().click.length).toBe(1);

    wrapper.setProps({ disabled: true });
    // FIXME when update test-utils
    // button.trigger('click');
    // expect(wrapper.emitted().click).toBeFalsy();
    expect(button.attributes().disabled).toBeTruthy();

    wrapper.setProps({ disabled: false });
    expect(button.attributes().disabled).toBeFalsy();

    button.trigger('click');

    await new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, 40);
    });
    expect(wrapper.emitted().click.length).toBe(2);
    done();
  });
});
