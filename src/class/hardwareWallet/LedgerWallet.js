import LedgerTransport from '@ledgerhq/hw-transport-u2f'; // for browser
import Eth from '@ledgerhq/hw-app-eth';
import Tx from 'ethereumjs-tx';
import { NotificationError } from '@/class';

export default class LedgerWallet {
  static async getNextWallets({ offset = 0, limit = 10 }) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);

      const addressesPromises = [...Array(limit)]
        .map((_, i) => offset + i)
        .map(idx => `m/44'/60'/${idx}'/0/0`)
        .map(path => eth.getAddress(path, false, false));

      const payload = await Promise.all(addressesPromises);

      return payload.map(({ address }) => address);
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      await transport.close().catch(console.log);
    }
  }

  static async sign(data, index) {
    throw new Error('Not implemented');
  }

  static async signTransaction(transaction, index) {
    throw new Error('Not implemented');
  }
}
