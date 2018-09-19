import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { shallow, createLocalVue } from '@vue/test-utils';
import CodePasswordModal from '@/components/modal/CodePasswordModal';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('CodePasswordModal', () => {
  let wrapper;

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(CodePasswordModal, {
        props: {
          code: 'foo',
        },
        localVue: createLocalVue(),
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('CodePasswordModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
