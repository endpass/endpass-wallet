import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VueTimers from 'vue-timers/mixin';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';

import NewWallet from '@/components/pages/NewWallet.vue';
import validation from '@/validation';

const localVue = createLocalVue();

localVue.use(Notifications);
localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);
localVue.use(VueRouter);

jest.useFakeTimers();

describe('NewWallet page', () => {
  let wrapper;
  let router;
  describe('computed', () => {
    describe('getRemainingSeedPhraseTimeout', () => {
      beforeAll(() => {
        const actions = {
          'accounts/addHdWallet': jest.fn(),
          'accounts/backupSeed': jest.fn(),
        };
        const store = new Vuex.Store({
          state: {
            accounts: {
              hdWallet: null,
            },
          },
          actions,
        });

        router = new VueRouter();

        wrapper = mount(NewWallet, {
          localVue,
          store,
          router,
          sync: false,
          mixins: [VueTimers],
        });
      });

      it('should return empty string', () => {
        wrapper.setData({ remainingSeedPhraseTimeout: 0 });
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe('');

        wrapper.setData({ remainingSeedPhraseTimeout: -10 });
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe('');
      });

      it('should return number of remaining seconds', () => {
        let remainingSeedPhraseTimeout = 1;

        wrapper.setData({ remainingSeedPhraseTimeout });
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe(
          `(${remainingSeedPhraseTimeout})`,
        );

        remainingSeedPhraseTimeout = 10;
        wrapper.setData({ remainingSeedPhraseTimeout });
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe(
          `(${remainingSeedPhraseTimeout})`,
        );
      });
    });
  });

  describe('methods', () => {
    // describe('createWallet', () => {
    //   let wrapper;
    //
    //   beforeAll(() => {
    //     const actions = {
    //       'addHdWallet': jest.fn(),
    //       'accounts/backupSeed': jest.fn(),
    //     };
    //     const store = new Vuex.Store({
    //       modules:{
    //         accounts: {
    //           state: {
    //             hdWallet: null,
    //           },
    //           namespaced: true,
    //           actions
    //         }
    //       }
    //     });
    //     wrapper = shallow(NewWallet, {
    //       localVue,
    //       store,
    //       mixins: [VueTimers]
    //     })
    //     wrapper.vm.createWallet();
    //     let spy = jest.spyOn(wrapper.vm.$timer, 'start');
    //   });

    // it('should start seed phrase timer', (done) => {
    //   jest.runOnlyPendingTimers();
    //   jest.advanceTimersByTime(50);
    //   expect(wrapper.vm.$timer.start).toHaveBeenCalledTimes(1);
    //   expect(wrapper.vm.$timer.start).toHaveBeenCalledWith('seedPhrase');
    // });
    // });

    describe('handleSeedPhraseTimer', () => {
      beforeEach(() => {
        const actions = {
          'accounts/addHdWallet': jest.fn(),
          'accounts/backupSeed': jest.fn(),
        };
        const store = new Vuex.Store({
          state: {
            accounts: {
              hdWallet: null,
            },
          },
          actions,
        });
        const $ga = { event: jest.fn() };

        router = new VueRouter();

        wrapper = mount(NewWallet, {
          localVue,
          store,
          sync: false,
          router,
          mocks: {
            $ga,
          },
          mixins: [VueTimers],
        });

        jest.spyOn(wrapper.vm.$timer, 'stop');
      });

      it('should reduce the remainingSeedPhraseTimeout for one second', () => {
        const { remainingSeedPhraseTimeout } = wrapper.vm;

        wrapper.vm.handleSeedPhraseTimer();

        expect(wrapper.vm.remainingSeedPhraseTimeout).toBe(
          remainingSeedPhraseTimeout - 1,
        );
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledTimes(0);
      });

      it('should stop seedPhrase timer', () => {
        const remainingSeedPhraseTimeout = 1;

        wrapper.setData({ remainingSeedPhraseTimeout });
        wrapper.vm.handleSeedPhraseTimer();

        expect(wrapper.vm.remainingSeedPhraseTimeout).toBe(
          remainingSeedPhraseTimeout - 1,
        );
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledWith('seedPhrase');
      });
    });
  });

  describe('timers', () => {
    beforeAll(() => {
      const actions = {
        'accounts/addHdWallet': jest.fn(),
      };
      const store = new Vuex.Store({
        state: {
          accounts: {
            hdWallet: null,
          },
        },
        actions,
      });

      localVue.use(VeeValidate);
      router = new VueRouter();

      wrapper = shallowMount(NewWallet, {
        localVue,
        store,
        router,
        sync: false,
        mixins: [VueTimers],
      });
    });

    describe('seedPhrase', () => {
      it('should have seedPhrase timer', () => {
        expect(wrapper.vm.$options.timers.seedPhrase).toMatchObject({
          repeat: true,
          time: 1000,
          callback: expect.any(Function),
        });
      });

      it('should call handleSeedPhraseTimer', () => {
        jest.spyOn(wrapper.vm, 'handleSeedPhraseTimer');

        wrapper.vm.$timer.start('seedPhrase');
        jest.runOnlyPendingTimers();

        expect(wrapper.vm.handleSeedPhraseTimer).toHaveBeenCalledTimes(1);
      });
    });
  });
});
