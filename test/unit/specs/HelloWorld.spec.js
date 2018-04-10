import Home from '@/components/Home'

import { mount } from '@vue/test-utils'

describe('Home.vue', () => {
  it('should show page title', () => {
    const wrapper = mount(Home)
    let titleMsg = wrapper.find('.title')
    expect(titleMsg.text()).toEqual('Endpass Wallet')
  })
})
