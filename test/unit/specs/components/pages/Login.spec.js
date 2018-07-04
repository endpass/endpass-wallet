import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import validation from '@/validation';

import LoginPage from '@/components/pages/Login.vue';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);

describe('LoginPage', () => {
  let wrapper;
  let actions;
  let store;
  let options;

  describe('render', () => {
    let wrapper;

    beforeAll(() => {
      wrapper = shallow(LoginPage, {
        stubs: generateStubs(LoginPage)
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('login-page');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('the send button', () => {
      it('should change "disable" attribute', () => {
        wrapper.setData({ termsAccepted: true });
        expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();

        wrapper.setData({ termsAccepted: false });
        expect(wrapper.find('v-button').attributes().disabled).toBeTruthy();
      });
    });
  });

  beforeEach(() => {
    actions = {
      login: jest.fn(() => Promise.resolve()),
    };

    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          actions,
        },
      },
    });

    options = {
      store,
      localVue,
    };

    wrapper = shallow(LoginPage, options);
  });

  it('should call login action when click', async () => {
    wrapper = mount(LoginPage, options);

    const email = '123@123.com';

    wrapper.setData({ email });

    wrapper.find('a#send-button').trigger('click');

    await new Promise(res => setTimeout(res, 50));
    expect(actions.login).toHaveBeenCalledTimes(1);
    expect(actions.login).toBeCalledWith(expect.any(Object), email, undefined);

    await actions.login();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('p#success-message')).toBeTruthy();
  });

  // it('should validate data', async () => {
  //   wrapper = mount(LoginPage, {
  //     store,
  //     localVue,
  //   });

  //   const { errors } = wrapper.vm;

  //   wrapper.setData({
  //     email: '',
  //   });

  //   await wrapper.vm.$validator.validateAll();

  //   expect(errors.first('email').includes('required')).toBeTruthy();

  //   wrapper.setData({
  //     email: '123@123.com',
  //   });

  //   await wrapper.vm.$validator.validateAll();

  //   expect(errors.has('email')).toBeFalsy();

  //   wrapper.setData({
  //     email: '123',
  //   });

  //   await wrapper.vm.$validator.validateAll();

  //   expect(
  //     errors.first('email').includes('must be a valid email')
  //   ).toBeTruthy();
  // });
});
