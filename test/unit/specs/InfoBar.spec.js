import InfoBar from '@/components/InfoBar.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Router from 'vue-router'
import LocalStorageMock from '../localStorageMock.js'

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
        web3: {
          networks: [],
          activeNet: {}
        }
      },
      actions
    })
    wrapper = shallow(InfoBar, { store, localVue })
  })

<<<<<<< HEAD
  it('toogle modal state', () => {
    wrapper.vm.openCustomProviderModal();
    expect(wrapper.vm.customProviderModalOpen).toBe(true);
=======
  it('should load network from local storage', () => {
    localStorage.setItem('net', 'Chpok');
    wrapper = shallowMount(InfoBar, { store, localVue })
    expect(wrapper.vm.selectedNet).toBe('Chpok')
>>>>>>> a779fa5... tests refactored
  })
})
