import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueTimers from 'vue-timers/mixin'

import NewWallet from '@/components/pages/NewWallet.vue';

jest.useFakeTimers();

describe('NewWallet page', () => {
  describe('computed', () => {
    describe('getRemainingSeedPhraseTimeout', () => {
      let wrapper;

      beforeAll(() => {
        wrapper = shallow(NewWallet);
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
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe(`(${remainingSeedPhraseTimeout})`);

        remainingSeedPhraseTimeout = 10;
        wrapper.setData({ remainingSeedPhraseTimeout });
        expect(wrapper.vm.getRemainingSeedPhraseTimeout).toBe(`(${remainingSeedPhraseTimeout})`);
      });
    });
  });

  describe('methods', () => {
    describe('commitWalletCreationChanges', () => {
      let wrapper;

      beforeAll(() => {
        const actions = {
          'accounts/addAccount': jest.fn()
        };
        const mutations = {
          'accounts/setWallet': jest.fn()
        };
        const store = new Vuex.Store({ actions, mutations });
        const localVue = createLocalVue();
        const mockHdWallet = {
          deriveChild: jest.fn(() => ({
            getWallet: jest.fn(() => 'wallet')
          }))
        };

        wrapper = shallow(NewWallet, {
          localVue,
          store,
          mixins: [VueTimers]
        });

        spyOn(wrapper.vm.$timer, 'start');
        wrapper.vm.commitWalletCreationChanges(mockHdWallet);
      });

      it('should start seed phrase timer', () => {
        expect(wrapper.vm.$timer.start).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$timer.start).toHaveBeenCalledWith('seedPhrase');
      });
    });

    describe('handleSeedPhraseTimer', () => {
      let wrapper;

      beforeEach(() => {
        wrapper = shallow(NewWallet);

        spyOn(wrapper.vm.$timer, 'stop');
      });

      it('should reduce the remainingSeedPhraseTimeout for one second', () => {
        const remainingSeedPhraseTimeout = wrapper.vm.remainingSeedPhraseTimeout;

        wrapper.vm.handleSeedPhraseTimer();

        expect(wrapper.vm.remainingSeedPhraseTimeout).toBe(remainingSeedPhraseTimeout - 1);
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledTimes(0);
      });

      it('should stop seedPhrase timer', () => {
        const remainingSeedPhraseTimeout = 1;

        wrapper.setData({ remainingSeedPhraseTimeout });
        wrapper.vm.handleSeedPhraseTimer();

        expect(wrapper.vm.remainingSeedPhraseTimeout).toBe(remainingSeedPhraseTimeout - 1);
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$timer.stop).toHaveBeenCalledWith('seedPhrase');
      });
    });
  });

  describe('timers', () => {
    let wrapper;

    beforeAll(() => {
      wrapper = shallow(NewWallet);
    });

    describe('seedPhrase', () => {
      it('should have seedPhrase timer', () => {
        expect(wrapper.vm.$options.timers.seedPhrase).toMatchObject({
          repeat: true,
          time: 1000,
          callback: expect.any(Function)
        });
      });

      it('should call handleSeedPhraseTimer', () => {
        spyOn(wrapper.vm, 'handleSeedPhraseTimer');

        wrapper.vm.$timer.start('seedPhrase');
        jest.runOnlyPendingTimers();

        expect(wrapper.vm.handleSeedPhraseTimer).toHaveBeenCalledTimes(1);
      })
    });
  });
});
