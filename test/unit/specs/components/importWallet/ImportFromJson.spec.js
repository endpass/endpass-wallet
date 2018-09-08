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
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
