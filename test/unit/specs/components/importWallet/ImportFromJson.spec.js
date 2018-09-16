import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import ImportFromJson from '@/components/importWallet/ImportFromJson';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('ImportFromJson', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(ImportFromJson, {
        localVue,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ImportFromJson');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
