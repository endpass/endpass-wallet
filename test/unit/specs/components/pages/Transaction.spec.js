import { shallow } from '@vue/test-utils';
import Transaction from '@/components/pages/Transaction';
import { generateStubs } from '@/utils/testUtils';

describe('Transaction page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(Transaction, {
      stubs: generateStubs(Transaction),
    });
  });

  describe('render', () => {
    it('should render the initial state of the page', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should set Sign tab', () => {
      wrapper.setData({
        currentTab: 'sign',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should set Recover tab', () => {
      wrapper.setData({
        currentTab: 'recover',
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
