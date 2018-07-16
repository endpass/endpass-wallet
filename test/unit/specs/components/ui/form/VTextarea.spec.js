import { shallow } from '@vue/test-utils';

import VTextarea from '@/components/ui/form/VTextarea';

describe('VTextarea', () => {
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(VTextarea);
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('v-textarea');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render component with label', () => {
      wrapper.setProps({ label: 'Label' });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('props', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(VTextarea);
    });

    it('should render textarea props', () => {
      const props = {
        id: 'id',
        value: 'value',
        placeholder: 'placeholder',
        disabled: 'disabled',
        label: 'label',
      };
      const expectedProps = {
        id: 'id',
        placeholder: 'placeholder',
        disabled: 'disabled',
      };

      wrapper.setProps(props);

      expect(wrapper.find('textarea').attributes()).toEqual(
        expect.objectContaining(expectedProps),
      );
    });

    describe('value', () => {
      it('should change textarea value', () => {
        let value = 'value';

        wrapper.setProps({ value });
        expect(wrapper.find('textarea').element.value).toBe(value);

        value = '';
        wrapper.setProps({ value });
        expect(wrapper.find('textarea').element.value).toBe(value);
      });
    });
  });
});
