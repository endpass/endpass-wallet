import { shallow } from '@vue/test-utils';

import Balance from '@/components/Balance';

describe('Balance', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(Balance, {});
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('balance');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
