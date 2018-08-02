import axios from 'axios';
import moxios from 'moxios';

import gasPrice from '@/services/gas-price';

describe('gas price service', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  it('should get gas prices', () => {
    const response = {
      low: 1,
    };
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response,
      });
    });

    expect(gasPrice.getGasPrice()).resolves.toBe(response);
  });
});
