import { IDENTITY_MODE } from '@/constants';

import CustomProvider from './CustomProvider';
import LocalProvider from './LocalProvider';
import ServerProvider from './ServerProvider';

const map = {
  [IDENTITY_MODE.CUSTOM]: url => new CustomProvider(url),
  [IDENTITY_MODE.LOCAL]: url => new LocalProvider(url),
  [IDENTITY_MODE.DEFAULT]: url => new ServerProvider(url),
};

export default (type, url) => {
  const createMethod = map[type] || map[IDENTITY_MODE.DEFAULT];
  return createMethod(url);
};
