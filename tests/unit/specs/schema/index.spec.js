import { v3, address } from 'fixtures/accounts';
import { settings, networks } from 'fixtures/identity';
import { tokens, token } from 'fixtures/tokens';
import { cryptoDataPendingTransaction } from 'fixtures/transactions';

const {
  cryptoDataValidator,
  v3KeystoreValidator,
  identityValidator,
} = require.requireActual('@/schema');

describe('Schema validators', () => {
  describe('cryptoDataValidator', () => {
    describe('validateGasPrice', () => {
      it('should validate data', () => {
        const validData = {
          low: 0,
          medium: 0,
          high: 0,
        };

        expect(cryptoDataValidator.validateGasPrice(validData)).toEqual(
          validData,
        );
      });

      it('should not validate data', () => {
        const invalidDataArray = [
          {
            low: 0,
          },
          {},
          {
            low: '0',
            medium: 0,
            high: 0,
          },
          {
            low: 0,
            medium: 0,
            notHigh: 0,
          },
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            cryptoDataValidator.validateGasPrice(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('cryptoDataValidator.validateSymbolsPrices', () => {
      it('should validate data', () => {
        const validData = {
          ETH: { USD: 0 },
          $FFC: { USD: 0 },
          '1WO': { USD: 0 },
        };

        expect(cryptoDataValidator.validateSymbolsPrices(validData)).toEqual(
          validData,
        );
      });

      it('should not validate data', () => {
        const invalidDataArray = [
          {
            ETH: { USD: '0' },
          },
          {},
          {
            ETH: {},
          },
          {
            '': { USD: 0 },
          },
          {
            ETH: { '': 0 },
          },
        ];

        invalidDataArray.forEach(data => {
          expect(() => cryptoDataValidator.validateSymbolsPrices(data)).toThrow(
            expect.any(Error),
          );
        });
      });
    });

    describe('validatePendingTransactions', () => {
      const transaction = { ...cryptoDataPendingTransaction };

      it('should validate data', () => {
        const validData = {
          filterId: '0x1',
          transactions: [transaction, transaction],
        };

        expect(
          cryptoDataValidator.validatePendingTransactions(validData),
        ).toEqual(validData);
      });

      it('should not validate data', () => {
        const invalidDataArray = [
          {},
          {
            filterId: 1,
          },
          {
            transactions: [transaction],
          },
          {
            filterId: '1',
            transactions: [transaction],
          },
          {
            filterId: 1,
            transactions: {},
          },
          {
            filterId: 1,
            transactions: [{}],
          },
          {
            filterId: 1,
            transactions: [true],
          },
        ];

        invalidDataArray.forEach(data => {
          expect(() =>
            cryptoDataValidator.validatePendingTransactions(data),
          ).toThrow(expect.any(Error));
        });
      });
    });
  });

  describe('v3KeystoreValidator', () => {
    describe('validateAddresses', () => {
      it('should validate data', () => {
        const validDataArray = ['xpub09aAzZ', '0x09aAfF'];

        expect(v3KeystoreValidator.validateAddresses(validDataArray)).toEqual(
          validDataArray,
        );
      });

      it('should throw error when data is invalid', () => {
        const invalidDataArray = [
          ['123z'],
          ['0x123g'],
          ['0x123G'],
          ['0x12-3'],
          ['xpub12-3'],
          ['xpub12,3'],
          ['xpub12"3'],
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            v3KeystoreValidator.validateAddresses(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('validateAccount', () => {
      it('should validate data', () => {
        const validDataArray = [v3, {}, { address }];

        validDataArray.forEach(validData =>
          expect(v3KeystoreValidator.validateAccount(validData)).toEqual(
            validData,
          ),
        );
      });

      it('should throw error when data is invalid', () => {
        const unnecessary = '123';
        const { id, ...badV3 } = v3;
        const invalidDataArray = [
          { ...v3, address: '123' },
          { address, unnecessary },
          { unnecessary: '123' },
          badV3,
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            v3KeystoreValidator.validateAccount(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });
  });

  describe('identityValidator', () => {
    describe('validateUserSettings', () => {
      it('should validate data', () => {
        const { tokens, ...cleanSettings } = settings;
        const validDataArray = [
          settings,
          cleanSettings,
          { ...cleanSettings, networks: [] },
        ];

        validDataArray.forEach(data =>
          expect(identityValidator.validateUserSettings(data)).toEqual(data),
        );
      });

      it('should throw error when data is invalid', () => {
        const { email, ...invalidSettings } = settings;
        const invalidDataArray = [
          invalidSettings,
          { ...settings, email: '123' },
          { ...settings, networks: ['123'] },
          { ...settings, tokens: { address } },
          { ...settings, otpEnabled: 1 },
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            identityValidator.validateUserSettings(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('validateUserOtpSetting', () => {
      it('should validate data', () => {
        const validDataArray = [{ status: 'enabled' }, { secret: 'secret' }];

        validDataArray.forEach(data =>
          expect(identityValidator.validateUserOtpSetting(data)).toEqual(data),
        );
      });

      it('should throw error when data is invalid', () => {
        const invalidDataArray = [
          { status: 'enabled1' },
          { status: true },
          { secret: 1 },
          { secret: true },
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            identityValidator.validateUserOtpSetting(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('validateUserToken', () => {
      it('should validate data', () => {
        const validDataArray = [...tokens];

        validDataArray.forEach(data =>
          expect(identityValidator.validateUserToken(data)).toEqual(data),
        );
      });

      it('should throw error when data is invalid', () => {
        const { name, ...invalidToken } = token;
        const invalidDataArray = [
          { ...token, decimals: '12' },
          { ...token, address: '12' },
          { ...token, logo: '12' },
          { ...token, name: '' },
          { ...token, manuallyAdded: 'true' },
          invalidToken,
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            identityValidator.validateUserOtpSetting(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('validateUserNetwork', () => {
      it('should validate data', () => {
        const validDataArray = [...networks];

        validDataArray.forEach(data =>
          expect(identityValidator.validateUserNetwork(data)).toEqual(data),
        );
      });

      it('should throw error when data is invalid', () => {
        const { name, ...invalidNetwork } = networks[0];
        const invalidDataArray = [
          { ...networks, decimals: '12' },
          { ...networks, id: '12' },
          { ...networks, currency: '12' },
          { ...networks, name: '' },
          { ...networks, url: '//url.com' },
          invalidNetwork,
        ];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            identityValidator.validateUserNetwork(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });

    describe('validatePasswordRecoveryIdentifier', () => {
      it('should validate data', () => {
        const data = 'password recovery identifier';

        expect(
          identityValidator.validatePasswordRecoveryIdentifier(data),
        ).toEqual(data);
      });

      it('should throw error when data is invalid', () => {
        const invalidDataArray = [true, null, 1, undefined, {}];

        invalidDataArray.forEach(invalidData =>
          expect(() =>
            identityValidator.validateUserNetwork(invalidData),
          ).toThrow(expect.any(Error)),
        );
      });
    });
  });
});
