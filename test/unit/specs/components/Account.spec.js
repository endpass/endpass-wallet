import { shallow } from '@vue/test-utils';

import Account from '@/components/Account';

describe('Account', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(Account, {
        propsData: {
          address: '0x9999999999999999999999999999999999999999',
        },
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('Account');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render props', () => {
      const props = {
        address: '0x9eceefdf3554e178a6549006f2c02163e63c9fd8',
      };

      wrapper.setProps(props);

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
