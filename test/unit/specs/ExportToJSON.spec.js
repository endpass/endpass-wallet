import Vue from 'vue'
import axios from 'axios'
import moxios from 'moxios'
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ExportToJson from '@/components/ExportToJson.vue';
import Web3 from 'web3'
import EthWallet from 'ethereumjs-wallet'
import { infuraConf } from '@/config.js'

const wallet = EthWallet.generate()


const localVue = createLocalVue()

localVue.use(Vuex)
describe('ExportToJson', () => {
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {
          activeAccount: wallet
        }
      }
    })
    wrapper = shallow(ExportToJson, { store, localVue })
  })
  it('creates json and calls file saver ', () => {
    let spy = jest.fn();
    wrapper.vm.saveJSON = spy;
    wrapper.vm.exportJSON();
    expect(spy).toBeCalled();
  })
})
