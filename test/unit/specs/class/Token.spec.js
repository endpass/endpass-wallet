import { Token } from '@/class';
import web3 from 'web3';

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
      new Token({
        address: null,
      });
    }).toThrow();
  });

  it('creates transaction with API format', () => {
    const token = new Token(apiResponse);
    expect(token.address).toBe(
      web3.utils.toChecksumAddress(apiResponse.address),
    );
    expect(token.name).toBe(apiResponse.name);
    expect(token.decimals).toBe(apiResponse.decimals);
    expect(token.logo).toBe(apiResponse.logo);
    expect(token.symbol).toBe(apiResponse.symbol);
  });
});
