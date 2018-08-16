import { shallow, createLocalVue } from '@vue/test-utils';
import VToken from '@/components/VToken';
import { Token } from '@/class/Token';

const localVue = createLocalVue();

describe('Token', () => {
  let wrapper;
  let mockToken;

  beforeEach(() => {
    mockToken = new Token({
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      name: '0x Protocol Token',
      decimals: 18,
      logo: '/pop.jpg',
      symbol: '$KEK',
      balance: '0',
    });

    wrapper = shallow(VToken, {
      propsData: {
        token: mockToken,
      },
    });
  });

  it('should be a Vue component', () => {
    expect(wrapper.name()).toBe('v-token');
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('should show its logo, name and symbol', () => {
    expect(wrapper.find('.token-logo img').attributes().src).toBe(
      mockToken.logo,
    );
    expect(wrapper.find('.token-symbol').text()).toBe(mockToken.symbol);
    expect(wrapper.find('.token-name').text()).toBe(mockToken.name);
  });
});
