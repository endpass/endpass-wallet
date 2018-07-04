import Storage from './Storage';
import LocalStorage from './LocalStorage';
import ServerStorage from './ServerStorage';

export const localStore = new LocalStorage();
export const serverStore = new ServerStorage();
export default new Storage(localStore, serverStore);
