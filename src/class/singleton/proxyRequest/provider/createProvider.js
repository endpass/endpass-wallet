import { IDENTITY_MODE } from './identityModes';

import CustomProvider from './CustomProvider';
import LocalProvider from './LocalProvider';
import ServerProvider from './ServerProvider';

const map = {
  [IDENTITY_MODE.CUSTOM]: (url, connection) =>
    new CustomProvider(url, connection),
  [IDENTITY_MODE.LOCAL]: (url, connection) =>
    new LocalProvider(url, connection),
  [IDENTITY_MODE.DEFAULT]: (url, connection) =>
    new ServerProvider(url, connection),
};

export default (type, url, connection) => {
  const createMethod = map[type] || map[IDENTITY_MODE.DEFAULT];
  return createMethod(url, connection);
};
