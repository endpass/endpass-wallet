/* eslint-disable no-underscore-dangle */
import { mount, createLocalVue } from '@vue/test-utils';
import AccountChooser from '@/components/AccountChooser';
import { addresses } from 'fixtures/accounts';

const localVue = createLocalVue();

describe('AccountChooser', () => {
  let wrapper;
  let options;

  beforeEach(() => {
    options = { localVue };
    wrapper = mount(AccountChooser, options);
  });

  describe('render', () => {
    it('should render account chooser component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render error', () => {
      wrapper.setData({
        error: 'foo',
      });
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    describe('common mode', () => {
      it('should not set listeners to search input', async () => {
        expect.assertions(2);

        jest.spyOn(wrapper.vm, 'handleSearchBlur');
        jest.spyOn(wrapper.vm, 'handleSearchBlur');

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.find('.multiselect__input');

        searchInput.trigger('focus');
        searchInput.trigger('blur');

        expect(wrapper.vm.handleSearchBlur).not.toHaveBeenCalled();
        expect(wrapper.vm.handleSearchBlur).not.toHaveBeenCalled();
      });
    });

    describe('creatable mode', () => {
      beforeEach(() => {
        options = {
          localVue,
          propsData: {
            creatable: true,
          },
        };
        wrapper = mount(AccountChooser, options);
      });

      it('should set listeners to search input', async () => {
        expect.assertions(2);

        wrapper = mount(AccountChooser, options);

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
          value: addresses[0],
        });

        searchInput.trigger('focus');

        expect(searchInput.element.value).toEqual(addresses[0]);
      });
    });
  });
});
