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

    it('render balance correctly', () => {
      const amount = '12.123456789123456789';
      const price = '12.12';
      const decimals = 6;
      const props = {
        amount,
        price,
        decimals,
      };
      wrapper.setProps(props);
      expect(wrapper.find('.amount').text()).toBe('146.9363');
      expect(wrapper.find('.amount').element.title).toBe('146.936296');
    });
  });
});
