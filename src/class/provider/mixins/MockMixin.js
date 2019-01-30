const resolveFunction = value => () =>
  new Promise(resolve => {
    setTimeout(() => resolve(value));
  });

const rejectFunction = value => () =>
  new Promise((resolve, reject) => {
    setTimeout(() => reject(value));
  });

export default ParentProvider => {
  class MockProvider extends ParentProvider {
    mockValues = {};
    mockValuesOnce = {};

    _mockValue({ method, params = [] }, value, mockFunction) {
      this.mockValues[JSON.stringify({ method, params })] = mockFunction(value);
    }

    _mockValueOnce({ method, params = [] }, value, mockFunction) {
      const key = JSON.stringify({ method, params });
      const mockValueArray = this.mockValuesOnce[key] || [];

      if (mockValueArray.length === 0) {
        this.mockValuesOnce[key] = mockValueArray;
      }

      mockValueArray.push(mockFunction(value));
    }

    mockResolvedValue(request, response) {
      this._mockValue(request, response, resolveFunction);
    }

    mockResolvedValueOnce(request, response) {
      this._mockValueOnce(request, response, resolveFunction);
    }

    mockRejectedValue(request, response) {
      this._mockValue(request, response, rejectFunction);
    }

    mockRejectedValueOnce(request, response) {
      this._mockValueOnce(request, response, rejectFunction);
    }

    send(payload) {
      console.warn('Unmock sync web3 request', payload);

      return super.send(payload);
    }

    sendAsync(payload, callback) {
      const key = JSON.stringify({
        method: payload.method,
        params: payload.params,
      });
      const mockValuesOnceArray = this.mockValuesOnce[key];
      const mockValueFunctionOnce =
        mockValuesOnceArray && mockValuesOnceArray.shift();
      const mockValueFunction = mockValueFunctionOnce || this.mockValues[key];

      if (mockValueFunctionOnce && mockValuesOnceArray.length === 0) {
        delete this.mockValuesOnce[key];
      }

      if (mockValueFunction) {
        mockValueFunction()
          .then(value => {
            callback(null, {
              id: payload.id,
              jsonrpc: payload.jsonrpc,
              result: value,
            });
          })
          .catch(error => {
            callback(error);
          });
      } else {
        console.warn('Unmock async web3 request', payload);

        callback(null, {
          id: payload.id,
          jsonrpc: payload.jsonrpc,
          result: null,
        });
      }
    }
  }

  return MockProvider;
};
