import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import gasPrice from '@/services/gas-price';
import { cryptoDataAPIUrl } from '@/config';

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
    mock.onGet(`${cryptoDataAPIUrl}/gas/price`).reply(200, response);
    return expect(gasPrice.getGasPrice()).resolves.toEqual(response);
  });
});
