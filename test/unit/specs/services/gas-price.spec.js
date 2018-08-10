import axios from 'axios';
import moxios from 'moxios';

import gasPrice from '@/services/gas-price';
import { cryptoDataAPIUrl } from '@/config';

describe('gas price service', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('should get gas prices', done => {
    const response = {
      low: 1,
    };
    moxios.stubRequest(`${cryptoDataAPIUrl}/gas/price`, {
      status: 200,
      response,
    });
    moxios.wait(() => {
      expect(gasPrice.getGasPrice()).resolves.toBe(response);
      done();
    });
  });
});
