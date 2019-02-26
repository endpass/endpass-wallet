import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import BasePage from '@/components/pages/Base';

describe('Base page', () => {
  let wrapper;
  let options;

  beforeEach(() => {
    options = {
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    };

    wrapper = shallowMount(BasePage, options);
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('BasePage');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render the initial state of the page', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render default slot', () => {
      const wrapper = shallowMount(BasePage, {
        ...options,
        slots: {
          default: '<div>default slot</div>',
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render title slot', () => {
      const wrapper = shallowMount(BasePage, {
        ...options,
        slots: {
          title: 'title',
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
