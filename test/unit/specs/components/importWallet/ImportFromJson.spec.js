import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

const localVue = createLocalVue();

localVue.use(VeeValidate);

import ImportFromJson from '@/components/importWallet/ImportFromJson';

describe('ImportFromJson', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(ImportFromJson, {
        localVue,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('import-from-json');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
