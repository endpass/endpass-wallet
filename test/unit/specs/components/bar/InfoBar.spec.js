import InfoBar from '@/components/bar/InfoBar.vue'
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Router from 'vue-router'
import LocalStorageMock from '../../../localStorageMock.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)

global.localStorage = LocalStorageMock;

describe('InfoBar', () => {
  let actions
  let store
  let wrapper
  beforeEach(() => {
    actions = {
      // 'web3/changeNetwork': jest.fn()
    }
    store = new Vuex.Store({
      state: {
        accounts: {
          balance: null
        },
        price: {
          price: 10
        },
        web3: {
          networks: [],
          activeNet: {}
        }
      },
      actions
    })
    wrapper = shallow(InfoBar, { store, localVue })
  })

  it('toogle modal state', () => {
    wrapper.vm.openCustomProviderModal();
    expect(wrapper.vm.customProviderModalOpen).toBe(true);
  })
})
