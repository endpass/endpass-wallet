import registerStores from './registerStores';
import ModuleRegister from '@/store/class/ModuleRegister';

import ConnectionStatusModule from './modules/ConnectionStatusModule';
import ErrorsModule from './modules/ErrorsModule';
import PriceModule from './modules/PriceModule';
import TokensModule from './modules/TokensModule';

export default function(store) {
  // new way
  const moduleRegister = new ModuleRegister(store);

  moduleRegister.registerModules({
    errors: ErrorsModule,
    connectionStatus: ConnectionStatusModule,
    price: PriceModule,
    tokens: TokensModule,
  });

  // old way
  registerStores(store);
}
