import Dexie from 'dexie';

const db = new Dexie('LocalProvider');

db.version(1.1).stores({
  accounts: 'id,data',
  accountsInfo: 'id,data',
  settings: 'id,data',
  tokens: 'id,data',
  networks: 'id,data',
});

export default db;
