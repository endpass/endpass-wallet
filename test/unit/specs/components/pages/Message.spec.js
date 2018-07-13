import { shallow } from '@vue/test-utils';
import Message from '@/components/pages/Message';
import { generateStubs } from '@/utils/testUtils';

describe('Message page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(Message, {
      stubs: generateStubs(Message)
    });
  });

  describe('render', () => {
    it('should render the initial state of the page', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
