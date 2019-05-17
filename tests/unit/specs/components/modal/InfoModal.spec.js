import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import InfoModal from '@/components/modal/InfoModal';

const localVue = createLocalVue();

localVue.use(UIComponents);

describe('InfoModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(InfoModal, {
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
          subTitle: 'bar',
        },
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
