import { mount, shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import AddTokenModal from '@/components/AddTokenModal.vue';
import { infuraConf } from '@/config';
import ethereumWalletMock from '../../fixtures/wallet.js';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

let fakeContract = {
  methods: {
    balanceOf: () => {
      call: () => {
        return new Promise((res, rej) => {
          res('balanceOf');
        });
      };
    },
    name: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            res('name');
          });
        },
      };
    },
    symbol: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            res('symbol');
          });
        },
      };
    },
    decimals: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            res('decimals');
          });
        },
      };
    },
  },
};

let fakeEmptyContract = {
  methods: {
    balanceOf: () => {
      call: () => {
        return new Promise((res, rej) => {
          rej();
        });
      };
    },
    name: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            rej();
          });
        },
      };
    },
    symbol: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            rej();
          });
        },
      };
    },
    decimals: () => {
      return {
        call: () => {
          return new Promise((res, rej) => {
            rej();
          });
        },
      };
    },
  },
};

describe('AddTokenModal', () => {
  let store;
  let wrapper;
  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        tokens: {
          namespaced: true,
          actions: {
            addTokenToSubscription() {},
          },
        },
      },
    });
    wrapper = shallow(AddTokenModal, { store, localVue });
  });
  it('gets contract data', done => {
    wrapper.vm.getTokenData(fakeContract).then(() => {
      expect(wrapper.vm.token.symbol).toBe('symbol');
      expect(wrapper.vm.token.name).toBe('name');
      expect(wrapper.vm.token.decimals).toBe('decimals');
      done();
    });
  });
  it('sets empty flags', done => {
    wrapper.vm.getTokenData(fakeEmptyContract).then(() => {
      expect(wrapper.vm.notFound.symbol).toBe(true);
      expect(wrapper.vm.notFound.name).toBe(true);
      expect(wrapper.vm.notFound.decimals).toBe(true);
      done();
    });
  });

  it('correctly resets contract data', done => {
    wrapper.vm.getTokenData(fakeContract).then(() => {
      wrapper.vm.addMore();
      expect(wrapper.vm.token.symbol).toBe('');
      expect(wrapper.vm.token.name).toBe('');
      expect(wrapper.vm.token.decimals).toBe('');
      done();
    });
  });

  it('correctly resets empty flags', done => {
    wrapper.vm.getTokenData(fakeEmptyContract).then(() => {
      wrapper.vm.addMore();
      expect(wrapper.vm.notFound.symbol).toBe(false);
      expect(wrapper.vm.notFound.name).toBe(false);
      expect(wrapper.vm.notFound.decimals).toBe(false);
      done();
    });
  });

  it('adds token', () => {
    let spy = jest.spyOn(wrapper.vm, 'addTokenToSubscription');
    wrapper.vm.addToken();
    expect(spy).toBeCalledWith(wrapper.vm.token);
  });
});
