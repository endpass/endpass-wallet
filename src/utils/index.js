import { get, identity } from 'lodash';

export { default as keystore } from './keystore';

export const asyncCheckProperty = (
  object,
  path,
  predicate = identity,
  timer = 250,
) =>
  new Promise(resolve => {
    /* eslint-disable-next-line */
    const interval = setInterval(() => {
      const value = get(object, path);

      if (predicate(value)) {
        clearInterval(interval);

        return resolve(value);
      }
    }, timer);
  });
