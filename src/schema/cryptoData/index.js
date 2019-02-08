import cryptoDataTokensSchemas from './tokens';
import cryptoDataTransactionsSchemas from './transactions';
import cryptoDataBalanceSchemas from './balance';
import cryptoDataSymbolPricesSchemas from './symbolPrices';
import cryptoDataGasPriceSchemas from './gasPrice';

export default {
  ...cryptoDataTokensSchemas,
  ...cryptoDataTransactionsSchemas,
  ...cryptoDataBalanceSchemas,
  ...cryptoDataSymbolPricesSchemas,
  ...cryptoDataGasPriceSchemas,
};
