/**
 * Chain sub providers class
 * @param {Web3ProviderClass} BaseProvider
 * @param {Array} subProvidersFactory
 * @return {ProviderClass}
 */
export default (BaseProvider, ...subProvidersFactory) =>
  subProvidersFactory.reduce(
    (ProviderClass, subProviderFactory) => subProviderFactory(ProviderClass),
    BaseProvider,
  );
