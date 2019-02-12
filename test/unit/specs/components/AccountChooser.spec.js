/* eslint-disable no-underscore-dangle */
import { createLocalVue } from '@vue/test-utils';
import AccountChooser from '@/components/AccountChooser';
import { addresses } from 'fixtures/accounts';
import { wrapMountFactory } from '@/testUtils';

const localVue = createLocalVue();

describe('AccountChooser', () => {
  let wrapper;
  let wrapperFactory;

  beforeEach(() => {
    wrapperFactory = wrapMountFactory(AccountChooser, {
      localVue,
      sync: false,
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should render account chooser component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    describe('common mode', () => {
      it('should not render search input', () => {
        expect(wrapper.find('.multiselect__input').exists()).toBe(false);
      });
    });

    describe('creatable mode', () => {
      beforeEach(() => {
        wrapper = wrapperFactory({
          propsData: {
            creatable: true,
          },
        });
      });

      it('should set listeners to search input', async () => {
        expect.assertions(2);

        wrapper = wrapperFactory({
          propsData: {
            creatable: true,
          },
        });

        jest.spyOn(wrapper.vm, 'handleSearchBlur');
        jest.spyOn(wrapper.vm, 'handleSearchBlur');

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.find('.multiselect__input');

        searchInput.trigger('focus');
        searchInput.trigger('blur');

        expect(wrapper.vm.handleSearchBlur).toHaveBeenCalled();
        expect(wrapper.vm.handleSearchBlur).toHaveBeenCalled();
      });

      it('should call input handler on search input if address valid', async () => {
        expect.assertions(3);

        const searchInput = wrapper.find('.multiselect__input');

        wrapper.vm.emitInput = jest.fn();
        await wrapper.vm.$nextTick();

        wrapper.setData({
          newAccountAddress: addresses[1],
        });

        searchInput.trigger('blur');

        expect(wrapper.vm.emitInput).toHaveBeenCalled();
        expect(wrapper.vm.emitInput).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.emitInput).toHaveBeenCalledWith(addresses[1]);
      });

      it('should show message if address is not valid', async () => {
        expect.assertions(2);

        const searchInput = wrapper.find('.multiselect__input');

        wrapper.vm.emitInput = jest.fn();
        await wrapper.vm.$nextTick();

        wrapper.setData({
          newAccountAddress: 'foo',
        });
        searchInput.trigger('focus');

        const chooserOptions = wrapper.find('.multiselect__option span');

        expect(chooserOptions.text()).toEqual('This is not a valid address');

        searchInput.trigger('blur');

        expect(wrapper.vm.emitInput).not.toHaveBeenCalled();
      });

      it('should set value to search input on focus last search value if value not present', async () => {
        expect.assertions(1);

        const searchInput = wrapper.find('.multiselect__input');

        await wrapper.vm.$nextTick();

        wrapper.setData({
          newAccountAddress: 'foo',
        });
        wrapper.setProps({
          value: addresses[0],
        });

        searchInput.trigger('focus');

        await wrapper.vm.$nextTick();

        expect(searchInput.element.value).toEqual(addresses[0]);
      });
    });
  });
});
