import { shallow } from '@vue/test-utils';

import VTextarea from '@/components/ui/form/VTextarea';

describe('VTextarea', () => {
  const attrs = {
    id: 'id',
    placeholder: 'placeholder',
    disabled: 'disabled',
  };
  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(VTextarea, {
        attrs,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('VTextarea');
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
      wrapper = shallow(VTextarea, {
        attrs,
      });
    });

    it('should render textarea attributes', () => {
      const expectedAttrs = {
        id: 'id',
        placeholder: 'placeholder',
        disabled: 'disabled',
      };

      expect(wrapper.find('textarea').attributes()).toEqual(
        expect.objectContaining(expectedAttrs),
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
