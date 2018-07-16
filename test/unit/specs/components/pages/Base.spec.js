import { shallow } from '@vue/test-utils';
import BasePage from '@/components/pages/Base';

describe('Base page', () => {
  describe('render', () => {
    it('should render the initial state of the page', () => {
      const wrapper = shallow(BasePage);

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render default slot', () => {
      const wrapper = shallow(BasePage, {
        slots: {
          default: '<div>default slot</div>',
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render title slot', () => {
      const wrapper = shallow(BasePage, {
        slots: {
          title: 'title',
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
