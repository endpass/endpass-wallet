import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ethplorerService from '@/services/ethplorer';
import { address } from 'fixtures/accounts';

describe('Ethplorer service', () => {
  const apiUrl = 'https://api.ethplorer.io';
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  ethplorerService.tokenIsNotSpam = jest.fn(() => true);

  describe('getTokensWithBalance', () => {
    const url = `${apiUrl}/getAddressInfo/${address}`;

    const successTokenResp = {
      tokens: [{ tokenInfo: 1 }, { tokenInfo: 2 }],
    };

    it('should make correct request', async () => {
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successTokenResp];
      });

      await ethplorerService.getTokensWithBalance(address);
    });

    it('should handle successfull request', async () => {
      mock.onGet(url).reply(200, successTokenResp);
      const result = await ethplorerService.getTokensWithBalance(address);

      expect(result).toHaveLength(2);
    });

    it('should return empty array with failed request', async () => {
      mock.onGet(url).reply(200, { success: false });
      const result = await ethplorerService.getTokensWithBalance(address);

      expect(result).toEqual([]);
    });

    it('should throw exception with rejected request', async () => {
      mock.onGet(url).reply(500, {});

      await expect(
        ethplorerService.getTokensWithBalance(address),
      ).rejects.toThrow();
    });
  });

  describe('getHistory', () => {
    const { getHistory } = ethplorerService;
    const url = `${apiUrl}/getAddressHistory/${address}`;

    const successResp = {
      operations: [{}, {}],
    };

    it('should make correct request', async () => {
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await getHistory(address);
    });

    it('should handle successfull request', async () => {
      mock.onGet(url).reply(200, successResp);
      const result = await getHistory(address);

      expect(result).toHaveLength(2);
    });

    it('should return empty array with failed request', async () => {
      mock.onGet(url).reply(200, { success: false });
      const result = await getHistory(address);

      expect(result).toEqual([]);
    });

    it('should throw exception with rejected request', async () => {
      mock.onGet(url).reply(500, {});

      await expect(getHistory(address)).rejects.toThrow();
    });
  });

  describe('getInfo', () => {
    const { getInfo } = ethplorerService;
    const url = `${apiUrl}/getAddressTransactions/${address}`;

    const successResp = [{}, {}];

    it('should make correct request', async () => {
      mock.onGet(url).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(url);

        return [200, successResp];
      });

      await getInfo(address);
    });

    it('should handle successfull request', async () => {
      mock.onGet(url).reply(200, successResp);
      const result = await getInfo(address);

      expect(result).toHaveLength(2);
    });

    it('should return empty array with failed request', async () => {
      mock.onGet(url).reply(200, undefined);
      const result = await getInfo(address);

      expect(result).toEqual([]);
    });

    it('should throw exception with rejected request', async () => {
      mock.onGet(url).reply(500, {});

      await expect(getInfo(address)).rejects.toThrow();
    });
  });
});
