import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import InfoModal from '@/components/modal/InfoModal';
import setupI18n from '@/locales/i18nSetup';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(UIComponents);

describe('InfoModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(InfoModal, {
      i18n,
      localVue,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('InfoModal');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render given props', () => {
      wrapper = shallowMount(InfoModal, {
        propsData: {
          title: 'foo',
          description: 'bar',
        },
        i18n,
        localVue,
      });
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should emit close event', () => {
      wrapper.find('v-button-stub').vm.$emit('click');
      expect(wrapper.emitted().close).toEqual([[]]);
    });
  });
});
