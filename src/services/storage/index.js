import Storage from './Storage';
import LocalStorage from './LocalStorage';

export const localStore = new LocalStorage();
export default new Storage(localStore);
