import { Token } from '@/class';
import { toChecksumAddress } from 'web3-utils';

const apiResponse = {
  address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
  name: '0x Protocol Token',
  decimals: 18,
  logo: '/pop.jpg',
  symbol: '$KEK',
};

describe('Transaction Class', () => {
  it('throws if address not present', () => {
    expect(() => {
      /* eslint-disable-next-line */
      Token.asObject({
        address: null,
      });
    }).toThrow();
  });

  it('creates transaction with API format', () => {
    const token = Token.asObject(apiResponse);
    expect(token.address).toBe(toChecksumAddress(apiResponse.address));
    expect(token.name).toBe(apiResponse.name);
    expect(token.decimals).toBe(apiResponse.decimals);
    expect(token.logo).toBe(apiResponse.logo);
    expect(token.symbol).toBe(apiResponse.symbol);
  });
});
