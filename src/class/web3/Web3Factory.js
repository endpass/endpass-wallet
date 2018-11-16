import Web3 from 'web3';

export default class Web3Factory {
  static create(provider) {
    const web3 = new Web3();
    const { setProvider } = web3;

    web3.setProvider = newProvider => {
      if (newProvider.errorHandler && newProvider.setErrorHandler) {
        const errorHandler = () => {
          const fallbackProvider = newProvider.getFallbackProvider();
          web3.setProvider(fallbackProvider);
        };

        newProvider.setErrorHandler(errorHandler);
      }

      return setProvider.call(web3, newProvider);
    };

    web3.setProvider(provider);

    return web3;
  }
}
