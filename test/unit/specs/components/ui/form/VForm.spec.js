import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import { generateStubs } from '@/utils/testUtils';

import VForm from '@/components/ui/form/VForm';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('VForm page', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(VForm, {
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('computed', () => {
    describe('isFormValid', () => {
      it("return false if there's errors", () => {
        wrapper.vm.errors.add({});
        expect(wrapper.vm.isFormValid).toBe(false);
      });
    });
  });
});
