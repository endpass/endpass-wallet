import Web3 from 'web3';

import web3 from '@/class/singleton/web3';
import { ProviderFactory } from '@/class';

const getProvider = (store, url) => {
  const newProvider = ProviderFactory.create(url);

  if (newProvider.getFallbackProviders && newProvider.setErrorHandler) {
    const errorHandler = async () => {
      const fallbackProviders = newProvider.getFallbackProviders();
      let fallbackProvider = null;

      for (let i = 0; i < fallbackProviders.length; i += 1) {
        try {
          const web3Temp = new Web3(fallbackProviders[i]);

          // This can be very long if the server is not responding for a long time(about 2 min)
          /* eslint-disable-next-line no-await-in-loop */
          await web3Temp.eth.net.getId();
          fallbackProvider = fallbackProviders[i];
          break;
          /* eslint-disable-next-line no-empty */
        } catch (error) {}
      }

      if (fallbackProvider) {
        setProvider(store, fallbackProvider);
      }
    };

    newProvider.setErrorHandler(errorHandler);
  }

  if (newProvider.startPollingNewBlockHeaders) {
    newProvider.startPollingNewBlockHeaders(
      web3.eth.getBlockNumber,
      web3.eth.getBlock,
    );
  }

  return newProvider;
};

const setProvider = ({ dispatch }, provider) => {
  web3.setProvider(provider);
  dispatch('web3/subscribeOnBlockUpdates');
};

export default store => {
  store.subscribe(({ type, payload }) => {
    if (type === 'web3/CHANGE_NETWORK') {
      setProvider(store, getProvider(store, payload.url));
    }
  });
};
