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
    };
    mock.onGet(`${ENV.cryptoDataAPIUrl}/gas/price`).reply(200, response);
    return expect(gasPrice.getGasPrice()).resolves.toEqual(response);
  });
});
