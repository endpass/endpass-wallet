const { cryptoDataValidator } = require.requireActual('@/schema');

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

    describe('validateSymbolPrice', () => {
      it('should validate data', () => {
        const validData1 = {
          USD: 0,
        };
        const validData2 = {
          $FFC: 0,
        };

        expect(cryptoDataValidator.validateSymbolPrice(validData1)).toEqual(
          validData1,
        );
        expect(cryptoDataValidator.validateSymbolPrice(validData2)).toEqual(
          validData2,
        );
      });

      it('should not validate data', () => {
        const invalidData1 = {
          USD: '0',
        };
        const invalidData2 = {};
        const invalidData3 = {
          USD: 0,
          BTC: 0,
        };
        const invalidData4 = {
          '': 0,
        };

        expect(() =>
          cryptoDataValidator.validateSymbolPrice(invalidData1),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolPrice(invalidData2),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolPrice(invalidData3),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolPrice(invalidData4),
        ).toThrow(expect.any(Error));
      });
    });

    describe('validateSymbolsPrice', () => {
      it('should validate data', () => {
        const validData = {
          ETH: { USD: 0 },
          $FFC: { USD: 0 },
          '1WO': { USD: 0 },
        };

        expect(cryptoDataValidator.validateSymbolsPrice(validData)).toEqual(
          validData,
        );
      });

      it('should not validate data', () => {
        const invalidData1 = {
          ETH: { USD: '0' },
        };
        const invalidData2 = {};
        const invalidData3 = {
          ETH: 0,
        };
        const invalidData4 = {
          ETH: {},
        };
        const invalidData5 = {
          '': { USD: 0 },
        };
        const invalidData6 = {
          ETH: { '': 0 },
        };

        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData1),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData2),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData3),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData4),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData5),
        ).toThrow(expect.any(Error));
        expect(() =>
          cryptoDataValidator.validateSymbolsPrice(invalidData6),
        ).toThrow(expect.any(Error));
      });
    });
  });
});
