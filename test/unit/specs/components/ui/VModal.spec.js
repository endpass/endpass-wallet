import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import VModal from '@/components/ui/VModal';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VModal page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(VModal, {
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('v-modal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
