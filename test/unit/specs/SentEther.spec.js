import Vue from 'vue'
import SendEther from '../../../src/components/SendPage.vue'


describe('SendEther', () => {
  it('sets correct data', () => {
    const vm = new Vue(SendEther).$mount();
    vm.gasPrice = '10';
    vm.gasLimit = '10';
    vm.value = '10';
    expect(vm.gasPrice).toBe('10');
    expect(vm.gasLimit).toBe('10');
    expect(vm.value).toBe('10');
    expect(vm.transaction.gasPrice).toBe('0x2540be400');
    expect(vm.transaction.gasLimit).toBe('0xa');
    expect(vm.transaction.value).toBe('0x8ac7230489e80000');
  })
})
