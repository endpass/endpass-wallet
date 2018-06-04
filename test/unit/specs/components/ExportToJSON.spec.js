import { mount, shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import ExportToJson from '@/components/ExportToJson.vue';
import web3 from 'web3';
import { infuraConf } from '@/config.js';
import ethereumWalletMock from '../../ethereumWalletMock.js';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ExportToJson', () => {
  let store;
  let wrapper;
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet,
        },
      },
    });
    wrapper = shallow(ExportToJson, { store, localVue });
  });
  it('creates json from wallet', done => {
    wrapper.vm.runExportJsonWorker().then(jsonData => {
      expect(jsonData).toBeTruthy();
      let walletData = JSON.parse(jsonData);
      expect(walletData.version).toBe(3);
      expect('0x' + walletData.address).toBe(wallet.getAddressString());
      done();
    });
  });
});
