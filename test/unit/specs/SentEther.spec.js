import Vue from 'vue'
import { shallow, createLocalVue } from '@vue/test-utils'
import VeeValidate from 'vee-validate'

import SendEther from '../../../src/components/SendPage.vue'

const localVue = createLocalVue()
localVue.use(VeeValidate)

describe('SendEther', () => {
  let wrapper
  beforeEach(() => {
  wrapper = shallow(SendEther, { localVue })
  })
  it('sets correct data', () => {
    wrapper.vm.gasPrice = 10;
    wrapper.vm.gasLimit = 10;
    wrapper.vm.value = 10;
    expect(wrapper.vm.gasPrice).toBe('10');
    expect(wrapper.vm.gasLimit).toBe('10');
    expect(wrapper.vm.value).toBe('10');
    expect(wrapper.vm.transaction.gasPrice).toBe('0x2540be400');
    expect(wrapper.vm.transaction.gasLimit).toBe('0xa');
    expect(wrapper.vm.transaction.value).toBe('0x8ac7230489e80000');
  })
})
