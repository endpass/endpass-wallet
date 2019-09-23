import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import setupI18n from '@/locales/i18nSetup';
import BasePage from '@/components/pages/Base';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

describe('Base page', () => {
  let wrapper;
  let options;

  beforeEach(() => {
    options = {
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      localVue,
      i18n,
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
