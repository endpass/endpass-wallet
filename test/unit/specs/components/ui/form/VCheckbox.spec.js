import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

const localVue = createLocalVue();

localVue.use(VeeValidate);
import VCheckbox from '@/components/ui/form/VCheckbox.vue';

localVue.use(VeeValidate);
describe('VCheckbox', () => {
  describe('render', () => {
    let wrapper;

    beforeAll(() => {
      wrapper = shallow(VCheckbox, {
        localVue,
        slots: {
          default: '<div/>',
        },
        provide: () => ({
          $validator: new VeeValidate.Validator(),
        }),
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('v-checkbox');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('props', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(VCheckbox, {
        localVue,
        provide: () => ({
          $validator: new VeeValidate.Validator(),
        }),
      });
    });

    describe('value', () => {
      it('should change checkbox state', () => {
        wrapper.setProps({ value: true });
        expect(
          wrapper.find('input[type="checkbox"]').element.checked,
        ).toBeTruthy();

        wrapper.setProps({ value: false });
        expect(
          wrapper.find('input[type="checkbox"]').element.checked,
        ).toBeFalsy();
      });
    });
  });
});
