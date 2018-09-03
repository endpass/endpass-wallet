import { shallow } from '@vue/test-utils';

import Balance from '@/components/Balance';

describe('Balance', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(Balance, {
        propsData: {
          amount: '12',
        },
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render props', () => {
      const currency = 'KEK';
      const props = {
        currency,
      };

      wrapper.setProps(props);

      expect(wrapper.find('.currency').text()).toBe(currency);
    });
  });
});
