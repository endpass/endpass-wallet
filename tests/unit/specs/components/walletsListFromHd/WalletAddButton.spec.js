import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import { address } from 'fixtures/accounts';
import WalletAddButton from '@/components/walletsListFromHd/WalletAddButton';

describe('WalletAddButton', () => {
  let localVue;
  let wrapper;

  beforeAll(() => {
    localVue = createLocalVue();
    localVue.use(UIComponents);
  });

  beforeEach(() => {
    wrapper = shallowMount(WalletAddButton, {
      localVue,
      propsData: {
        type: 'example',
        selectedAddress: {
          index: 0,
          address,
        },
      },
    });
  });

  it('should be a Vue component', () => {
    expect(wrapper.name()).toBe('WalletAddButton');
    expect(wrapper.isVueInstance()).toBeTruthy();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should handle import', async () => {
    expect.assertions(2);
    wrapper.setMethods({
      isHDv3WalletByType: jest.fn().mockReturnValue(true),
    });

    expect(wrapper.vm.isPasswordModal).toBe(false);
    wrapper.find('v-button-stub').vm.$emit('click');
    await global.flushPromises();
    expect(wrapper.vm.isPasswordModal).toBe(true);
  });

  it('should call vuex addHdChildWallets with correct arguments', async () => {
    expect.assertions(2);
    const password = 'xxxxxxxx';
    wrapper.setMethods({
      isHDv3WalletByType: jest.fn().mockReturnValue(true),
      addHdChildWallets: jest.fn(),
    });
    wrapper.setData({
      isPasswordModal: true,
    });
    await wrapper.vm.$nextTick();

    wrapper.find('password-modal-stub').vm.$emit('confirm', password);
    await global.flushPromises();

    expect(wrapper.vm.isHDv3WalletByType).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.addHdChildWallets).toBeCalledWith({
      address,
      index: wrapper.vm.selectedAddress.index,
      password,
      type: wrapper.vm.type,
    });
  });

  it('should call vuex addPublicWallet with correct arguments', async () => {
    expect.assertions(2);
    wrapper.setMethods({
      isHDv3WalletByType: jest.fn().mockReturnValue(false),
      addPublicWallet: jest.fn(),
    });
    wrapper.setData({
      isPasswordModal: true,
    });

    wrapper.find('password-modal-stub').vm.$emit('confirm');
    await global.flushPromises();

    expect(wrapper.vm.isHDv3WalletByType).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.addPublicWallet).toBeCalledWith({
      address,
      info: {
        type: wrapper.vm.type,
        index: wrapper.vm.selectedAddress.index,
      },
    });
  });
});
