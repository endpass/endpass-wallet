import { shallow } from '@vue/test-utils';

import VSpinner from '@/components/ui/VSpinner';

describe('VSpinner', () => {
  describe('render', () => {
    let wrapper;

    beforeAll(() => {
      wrapper = shallow(VSpinner);
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('VSpinner');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('props', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(VSpinner, {
        stubs: {
          spinner: '<spinner/>',
        },
      });
    });

    describe('isLoading', () => {
      it('should render component', () => {
        wrapper.setProps({ isLoading: true });

        expect(wrapper.element).toMatchSnapshot();
      });

      it('should not render component', () => {
        wrapper.setProps({ isLoading: false });

        expect(wrapper.element).toMatchSnapshot();
      });
    });

    describe('label', () => {
      beforeEach(() => {
        wrapper.setProps({ isLoading: true });
      });

      it('should render label', () => {
        const label = 'label';

        wrapper.setProps({ label });

        expect(wrapper.find('.spinner-label').text()).toBe(label);
      });

      it('should not render label', () => {
        wrapper.setProps({ label: '' });

        expect(wrapper.find('.spinner-label').exists()).toBeFalsy();
      });
    });
  });
});
