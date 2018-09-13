import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VForm from '@/components/ui/form/VForm';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VForm page', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(VForm, {
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('VForm');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
