import Web3 from 'web3';

export default class Web3Factory {
  static create(provider) {
    const web3 = new Web3();
    const { setProvider } = web3;

    web3.setProvider = newProvider => {
      if (
        newProvider.getFallbackProviders &&
        newProvider.errorHandler &&
        newProvider.setErrorHandler
      ) {
        const errorHandler = async () => {
          const fallbackProviders = newProvider.getFallbackProviders();
          let fallbackProvider = null;

          for (let i = 0; i < fallbackProviders.length; i += 1) {
            try {
              const web3Temp = new Web3(fallbackProviders[i]);
              /* eslint-disable-next-line no-await-in-loop */
              await web3Temp.eth.net.getId();
              fallbackProvider = fallbackProviders[i];
              break;
              /* eslint-disable-next-line no-empty */
            } catch (error) {}
          }

          if (fallbackProvider) {
            web3.setProvider(fallbackProvider);
          }
        };

        newProvider.setErrorHandler(errorHandler);
      }

      return setProvider.call(web3, newProvider);
    };

    web3.setProvider(provider);

    return web3;
  }
}
