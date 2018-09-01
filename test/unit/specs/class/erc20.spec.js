import { ERC20Token, Token } from '@/class';
import web3 from '@/utils/web3';

describe('ERC20 Token', () => {
  const tokenInfo = {
    name: 'token',
    symbol: 'ABC',
    decimals: 18,
    totalSupply: 100,
    balance: 1,
  };

  let address;
  let erc20;

  // method.call() returns given val
  const contractMethod = function(val) {
    return {
      call: jest.fn(() => val),
    };
  };

  const contractMethods = {
    name: () => contractMethod(tokenInfo.name),
    symbol: () => contractMethod(tokenInfo.symbol),
    decimals: () => contractMethod(tokenInfo.decimals),
    totalSupply: () => contractMethod(tokenInfo.totalSupply),
    balanceOf: addr => contractMethod(tokenInfo.balance),
  };

  beforeEach(() => {
    address = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
    erc20 = new ERC20Token(address);
  });

  it('saves address', () => {
    expect(erc20.address).toBe(address);
  });

  it('fetches contract from web3', () => {
    let contract = erc20.getContract();
    expect(contract).toBeTruthy();

    // Call again, contract should be cached
    let contract2 = erc20.getContract();
    expect(contract2).toEqual(contract);
  });

  it('builds Token from tokeninfo', async () => {
    let contract = erc20.getContract();
    contract.methods = contractMethods;

    let token = await erc20.getToken();

    expect(token).toBeInstanceOf(Token);

    expect(token.name).toEqual(tokenInfo.name);
    expect(token.symbol).toEqual(tokenInfo.symbol);
    expect(token.decimals).toEqual(tokenInfo.decimals);
  });
});
