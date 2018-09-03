import { shallow } from '@vue/test-utils';

import SearchInput from '@/components/SearchInput';

describe('SearchInput', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(SearchInput, {
        propsData: {
          value: '0',
        },
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render props', () => {
      const value = '11';
      const props = {
        value,
      };

      wrapper.setProps(props);

      expect(wrapper.find('.input').element.value).toBe(value);
    });

    it('should emit event with entered value', () => {
      const value = '11';
      const input = wrapper.find('.input');
      input.element.value = value;
      wrapper.find('.input').trigger('input');
      expect(wrapper.emitted('input')).toBeTruthy();
      expect(wrapper.emitted().input[0]).toEqual([value]);
    });
    it('should emit event with empty value when clicked on clear', () => {
      const value = '11';
      wrapper.find('.button').trigger('click');
      expect(wrapper.emitted('input')).toBeTruthy();
      expect(wrapper.emitted().input[0]).toEqual(['']);
    });
  });
});
