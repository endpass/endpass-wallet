import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VSelect from '@/components/ui/form/VRadio.vue';

const localVue = createLocalVue();

describe('VSelect', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VSelect, {
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  it('should render props', () => {
    expect(wrapper.contains('label')).toBeFalsy();
    expect(wrapper.contains('input')).toBeFalsy();

    wrapper.setProps({
      options: ['option1', 'option2'],
      value: 'option1',
      label: 'Some Label',
    });

    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(wrapper.findAll('input').length).toBe(2);
  });

  it('should emit event', () => {
    wrapper.setProps({
      options: ['option1', 'option2'],
      value: 'option2',
      label: 'Some Label',
    });
    expect(wrapper.emitted().input).toBeTruthy();
  });

  describe('props', () => {
    describe('options', () => {
      describe('options are strings', () => {
        it('should correctly render options', () => {
          const options = ['option1', 'option2'];

          wrapper.setProps({ options });

          expect(wrapper.find('.v-radio').html()).toMatchSnapshot();
        });
      });

      describe('options are objects', () => {
        it('should correctly render text of options', () => {
          const options = [{ text: 'text' }, {}];

          wrapper.setProps({ options });

          expect(wrapper.find('.v-radio').html()).toMatchSnapshot();
        });

        it('should correctly render values of options', () => {
          const options = [{ val: 'val' }, {}];

          wrapper.setProps({ options });

          expect(wrapper.find('.v-radio').html()).toMatchSnapshot();
        });
      });

      describe('options have different types', () => {
        it('should correctly render options', () => {
          const options = [
            'option',
            { val: 'option value', text: 'option text' },
          ];

          wrapper.setProps({ options });

          expect(wrapper.find('.v-radio').html()).toMatchSnapshot();
        });
      });
    });
  });
});
