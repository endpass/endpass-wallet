import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';
import { seed } from 'fixtures/accounts';
import SeedRecovery from '@/components/SeedRecovery';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('SeedRecovery', () => {
  let accountsModule;
  let storeOptions;
  let store;
  let wrapper;

  beforeEach(() => {
    accountsModule = {
      actions: {
        recoverSeed: jest.fn().mockResolvedValue(seed),
      },
      namespaced: true,
    };
    storeOptions = {
      modules: {
        accounts: accountsModule,
      },
    };
    store = new Vuex.Store(storeOptions);
    wrapper = shallowMount(SeedRecovery, {
      store,
      localVue,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('SeedRecovery');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
      expect(wrapper.find('info-modal-stub').exists()).toBe(false);
    });

    it('should render password modal', async () => {
      expect.assertions(1);

      wrapper.setData({
        isPasswordModalVisible: true,
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(true);
    });

    it('should render info modal with recovered seed', async () => {
      expect.assertions(2);

      wrapper.setData({
        recoveredSeed: seed,
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('info-modal-stub').exists()).toBe(true);
      expect(wrapper.find('[data-test=recovered-seed-phrase]').text()).toBe(
        seed,
      );
    });
  });

  describe('bahavior', () => {
    it('should show password modal on recover button click', async () => {
      expect.assertions(1);

      wrapper.find('[data-test=recover-seed-button]').vm.$emit('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(true);
    });

    it('should close password modal', async () => {
      expect.assertions(2);

      wrapper.setData({
        isPasswordModalVisible: true,
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(true);

      wrapper.find('password-modal-stub').vm.$emit('close');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
    });

    it('should close info modal with seed', async () => {
      expect.assertions(3);

      wrapper.setData({
        recoveredSeed: seed,
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('info-modal-stub').exists()).toBe(true);

      wrapper.find('info-modal-stub').vm.$emit('close');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.recoveredSeed).toBeNull();
      expect(wrapper.find('info-modal-stub').exists()).toBe(false);
    });

    it('should show recovered seed', async () => {
      expect.assertions(2);

      wrapper.setData({
        isPasswordModalVisible: true,
      });
      await wrapper.vm.$nextTick();
      wrapper.find('password-modal-stub').vm.$emit('confirm');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
      expect(wrapper.find('info-modal-stub').exists()).toBe(true);
    });

    it('should close recovered seed', async () => {
      expect.assertions(1);

      wrapper.setData({
        recoveredSeed: seed,
      });
      await wrapper.vm.$nextTick();
      wrapper.find('info-modal-stub').vm.$emit('close');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('info-modal-stub').exists()).toBe(false);
    });

    it('should emit lock if seed recovery throws', async () => {
      expect.assertions(2);

      accountsModule.actions.recoverSeed.mockRejectedValueOnce();
      wrapper.setData({
        isPasswordModalVisible: true,
      });
      await wrapper.vm.$nextTick();
      wrapper.find('password-modal-stub').vm.$emit('confirm');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
      expect(wrapper.emitted().lock).toEqual([[]]);
    });

    it('should has disabled button on lock state', async () => {
      expect.assertions(1);

      wrapper = shallowMount(SeedRecovery, {
        store,
        localVue,
        sync: false,
        propsData: {
          isLocked: true,
        },
      });

      expect(
        wrapper.find('[data-test=recover-seed-button]').attributes().disabled,
      ).toBe('true');
    });
  });
});
