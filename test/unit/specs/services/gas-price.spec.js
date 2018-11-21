import MockAdapter from 'axios-mock-adapter';

import { http } from '@/class/singleton';

const gasPrice = require.requireActual('@/services/gas-price').default;

describe('gas price service', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(http);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should get gas prices', () => {
    const response = {
      low: 1,
      medium: 0,
      high: 0,
    };

    mock.onGet(`${ENV.cryptoDataAPIUrl}/gas/price`).reply(200, response);

    expect(gasPrice.getGasPrice()).resolves.toEqual(response);
  });

  it('should validate gas price and throw error if data is not valid', () => {
    mock.onGet(`${ENV.cryptoDataAPIUrl}/gas/price`).reply(200, {
      low: 'foo',
    });

    expect(gasPrice.getGasPrice()).rejects.toThrow();
  });
});
