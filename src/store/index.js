import createStore from './createStore';
import registerModules from './registerModules';
import watchStore from './watchStore';

const store = createStore();

registerModules(store);
watchStore(store);

export default store;
