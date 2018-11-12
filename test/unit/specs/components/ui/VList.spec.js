import { shallow, createLocalVue } from '@vue/test-utils';

import VList from '@/components/ui/VList.vue';

const localVue = createLocalVue();

describe('VList', () => {
  let wrapper;
  const props = {
    label: 'Some Label',
    list: {
      item1: 'text1',
      item2: 'text2',
    },
  };

  beforeEach(() => {
    wrapper = shallow(VList, { localVue });
  });

  describe('props', () => {
    it('should render props', () => {
      expect(wrapper.contains('p')).toBeFalsy();
      expect(wrapper.contains('ul')).toBeFalsy();
      expect(wrapper.vm.$data.active).toBeFalsy();

      wrapper.setProps(props);

      expect(wrapper.find('p').text()).toBe('Some Label');
      expect(wrapper.findAll('li')).toHaveLength(2);
      expect(wrapper.vm.$data.active).toBe('item1');
    });

    it('should not render active item', async () => {
      wrapper.setProps({
        ...props,
        hasDefaultActive: false,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.active).toBeNull();
    });
  });

  describe('behavior', () => {
    it('should emit event', () => {
      wrapper.setProps(props);

      wrapper
        .findAll('a')
        .at(1)
        .trigger('click');

      // FIXME unexpected behavior, nextTick don't help
      // expect(wrapper.vm.$data.active).toBe('item2');
      expect(wrapper.emitted().input).toHaveLength(2);
    });
  });
});
