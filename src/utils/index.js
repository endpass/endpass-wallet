import store from '../store';
import { DEFAULT_NETWORKS } from '@/constants';

export { default as http } from './http';
export { default as web3 } from './web3';
export { default as keystore } from './keystore';
export { default as proxyRequest } from './proxyRequest';

export const getInitializedValueFromStore = (module, field) =>
  new Promise(resolve => {
    const value = module[field];
    if (value === null) {
      const unwatch = store.watch(
        () => module[field],
        newValue => {
          unwatch();
          resolve(newValue);
        },
      );
    } else {
      resolve(value);
    }
  });
