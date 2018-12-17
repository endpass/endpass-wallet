import 'mocks/class/singleton/proxyRequest/provider/database';
import LocalProvider from '@/class/singleton/proxyRequest/provider/LocalProvider';

describe('LocalProvider', () => {
  const apiUrl = '/test/url/';
  const instance = new LocalProvider(apiUrl);

  function readData(readUrl) {
    return instance.request({
      url: readUrl,
      method: 'read',
    });
  }

  function writeData(writeUrl, payload) {
    return instance.request({
      url: writeUrl,
      method: 'write',
      payload,
    });
  }

  function appendData(writeUrl, payload) {
    return instance.request({
      url: writeUrl,
      method: 'add',
      payload,
    });
  }

  function removeItem(writeUrl) {
    return instance.request({
      url: writeUrl,
      method: 'remove',
    });
  }

  const isEmptyData = 'Data is empty';

  describe('account', () => {
    it('should read empty array from /accounts', async () => {
      expect.assertions(1);

      const data = await readData(`${apiUrl}accounts`);
      expect(data).toHaveLength(0);
    });

    it('should return list of addresses in which each cell is a string, not object', async () => {
      expect.assertions(3);

      const addressId = 'testAddrId';

      // step 1. prepare data
      const url = `${apiUrl}account/${addressId}`;
      const result = await writeData(url, {
        address: addressId,
        data: 'testData',
      });

      expect(result.success).toBe(true);

      // step 2. read list and check, that all structures are passed
      const data = await readData(`${apiUrl}accounts`);
      const item = data[0];
      expect(item).toBe(addressId);
      expect(data).toHaveLength(1);
    });
  });

  describe('token', () => {
    const defaultTokenId = 'tokenId';
    const defaultNetworkId = 'networkId';

    function getTokenUrl(token = defaultTokenId, network = defaultNetworkId) {
      return `${apiUrl}tokens/${network}/${token}`;
    }

    function getNetworkUrl(network = defaultNetworkId) {
      return `${apiUrl}tokens/${network}`;
    }

    it('should be empty array', async () => {
      expect.assertions(1);

      const data = await readData(getNetworkUrl());
      expect(data).toHaveLength(0);
    });

    it('should return error, when read single item', async () => {
      expect.assertions(1);

      await expect(readData(getTokenUrl())).rejects.toEqual(isEmptyData);
    });

    it('should be list with only selected networkId', async () => {
      expect.assertions(7);
      const checkFieldData = 'checkId';
      // step 1. write to other network with the same token id
      const writeResult = await writeData(
        getTokenUrl(defaultTokenId, 'notOurNetwork'),
        {
          checkId: 'otherId',
          data: 'otherData',
        },
      );
      expect(writeResult.success).toBe(true);

      // step 2. write to our network with the same token id, but with different data
      const result = await appendData(getTokenUrl(defaultTokenId), {
        checkId: checkFieldData,
      });
      expect(result.success).toBe(true);

      // step 3. check, that we stored correct token
      const singleItem = await readData(getTokenUrl(defaultTokenId));
      expect(singleItem.checkId).toBe(checkFieldData);
      expect(singleItem.data).toBeUndefined();

      // step 4. check, that we have only one token in one network
      const tokens = await readData(getNetworkUrl());
      expect(tokens).toHaveLength(1);
      const token = tokens[0];
      expect(token.checkId).toBe(checkFieldData);
      expect(singleItem.data).toBeUndefined();
    });

    it('should remove item correctly', async () => {
      expect.assertions(6);

      // step 1. write first token
      const result = await writeData(getTokenUrl(), {
        checkId: 'checkId',
        data: 'firstData',
      });
      expect(result.success).toBe(true);

      // step 2. write second token
      const secondToken = getTokenUrl('tokenSecond');
      const secondDataCheck = 'secondData';
      const resultSecond = await writeData(secondToken, {
        data: secondDataCheck,
      });
      expect(resultSecond.success).toBe(true);

      // step 3. read all tokens
      const data = await readData(getNetworkUrl());
      expect(data).toHaveLength(2);

      // step 4. remove first token
      const removeData = await removeItem(getTokenUrl());
      expect(removeData.success).toBe(true);

      // step 5. check token list, that data was removed
      const secondData = await readData(getNetworkUrl());
      expect(secondData).toHaveLength(1);
      expect(secondData[0].data).toBe(secondDataCheck);
    });
  });

  describe('settings', () => {
    const url = `${apiUrl}settings`;
    const checkValue = 'testValue';

    // step 0. prepare database structure
    beforeEach(async () => {
      expect.assertions(1);
      const result = await writeData(url, {
        testField: checkValue,
      });
      expect(result.success).toBe(true);
    });

    it('rewrite data to settings', async () => {
      expect.assertions(4);

      const checkFieldSecond = 'testFieldSecond';

      // step 1. check, that structure is correct
      const data = await readData(url);
      expect(data).toEqual(
        expect.objectContaining({
          testField: checkValue,
          tokens: expect.any(Object),
          networks: expect.any(Array),
        }),
      );

      // step 2. rewrite structure
      const resultSecond = await writeData(url, {
        testFieldSecond: checkFieldSecond,
      });
      expect(resultSecond.success).toBe(true);

      // step 3. check, that data is rewrites
      const readSecond = await readData(url);
      expect(readSecond).toEqual(
        expect.objectContaining({
          testFieldSecond: checkFieldSecond,
          tokens: expect.any(Object),
          networks: expect.any(Array),
        }),
      );
    });

    it('should append data in settings', async () => {
      expect.assertions(5);

      // step 1. check that all is stored
      const readCheck1 = await readData(url);
      expect(readCheck1.testField).toBe(checkValue);

      // step 2. append data
      const addResult = await appendData(url, {
        secondField: 'secondField',
      });
      expect(addResult.success).toBe(true);

      // step 3. check append correct
      const readCheck2 = await readData(url);
      expect(readCheck2.testField).toBe(checkValue);
      expect(readCheck2.secondField).toBe('secondField');
    });

    it('should be cleared database', async () => {
      expect.assertions(3);

      // step 1. data must be in storage
      const readCheck = await readData(url);
      expect(readCheck.testField).toBe(checkValue);

      // step 2. do clear database
      await instance.clear();
      await expect(readData(url)).rejects.toEqual(isEmptyData);
    });
  });

  describe('network', () => {
    const url = `${apiUrl}networks`;
    const checkValue = 'testValueNetwork';
    const networkPath = 'http://network.test/the/id';
    const networkUrl = `${url}/${networkPath}`;
    const settingsUrl = `${apiUrl}settings`;

    it('should write network data', async () => {
      expect.assertions(4);

      // step 1. write network data
      const writeResult = await writeData(networkUrl, {
        testField: checkValue,
      });
      expect(writeResult.success).toBe(true);

      // step 2. check, that structure is correct
      const data = await readData(networkUrl);
      expect(data).toEqual(
        expect.objectContaining({
          testField: checkValue,
        }),
      );

      // step3. prepare settings. Settings data must be in structure
      const result = await writeData(settingsUrl, {
        testField: checkValue,
      });
      expect(result.success).toBe(true);

      // step4. check, that network will return in settings request
      const readSecond = await readData(settingsUrl);
      expect(readSecond.networks[0].testField).toBe(checkValue);
    });
  });
});
