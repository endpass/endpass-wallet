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
      expect(wrapper.name()).toBe('import-from-json');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
