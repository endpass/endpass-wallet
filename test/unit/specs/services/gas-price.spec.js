import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const gasPrice = require.requireActual('@/services/gas-price').default;

describe('gas price service', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should get gas prices', () => {
    const response = {
      low: 1,
    };
    mock.onGet(`${env.cryptoDataAPIUrl}/gas/price`).reply(200, response);
    return expect(gasPrice.getGasPrice()).resolves.toEqual(response);
  });
});
