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

  it('correctly sets required errors', () => {
    const vm = new Vue(SendEther).$mount();
    vm.validateTo();
    let errFound = vm.activeErrors.to.find(err => {
      return err.type === 'required';
    })
    expect(typeof errFound).toBe('object');
  })
  it('correctly sets invalid address', () => {
    const vm = new Vue(SendEther).$mount();
    vm.transaction.to = '0x12345'
    vm.validateTo();
    let errFound = vm.activeErrors.to.find(err => {
      return err.type === 'invalid';
    })
    expect(typeof errFound).toBe('object');
  })
  it('correctly sets zero address', () => {
    const vm = new Vue(SendEther).$mount();
    vm.transaction.to = '0x0000000000000000000000000000000000000000'
    vm.validateTo();
    let errFound = vm.activeErrors.to.find(err => {
      return err.type === 'zeroAdress';
    })
    expect(typeof errFound).toBe('object');
  })
})
