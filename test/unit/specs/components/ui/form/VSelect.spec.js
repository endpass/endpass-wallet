import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VSelect from '@/components/ui/form/VSelect.vue';

const localVue = createLocalVue();

describe('VSelect', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VSelect, { localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      })
    });
  });

  it('should render props', () => {
    expect(wrapper.contains('label')).toBeFalsy();
    expect(wrapper.contains('option')).toBeFalsy();

    wrapper.setProps({
      options: ['option1', 'option2'],
      value: 'option1',
      label: 'Some Label',
    });

    expect(wrapper.find('label').text()).toBe('Some Label');
    expect(wrapper.findAll('option').length).toBe(2);
  });

  it('should emit event', () => {
    wrapper.find('select').trigger('change');
    expect(wrapper.emitted().input).toBeTruthy();
  });
});
