import TrezorConnect from 'trezor-connect';
import Tx from 'ethereumjs-tx';
import { NotificationError } from '@/class';

export default class TrezorWallet {
  static async getNextWallets({ offset = 0, limit = 10 }) {
    try {
      const bundleParams = [...Array(limit)].map((_, i) => ({
        path: `m/44'/60'/${offset + i}`,
        showOnTrezor: false,
      }));

      const { success, payload } = await TrezorConnect.ethereumGetAddress({
        bundle: bundleParams,
      });

      if (!success) {
        throw new Error('Bad response');
      }

      return payload.map(({ address }) => address);
    } catch (error) {
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    }
  }

  static async sign(data, index) {
    throw new Error('Not implemented');
  }

  static async signTransaction(transaction, index) {
    const {
      payload,
      error,
      status = true,
    } = await TrezorConnect.ethereumSignTransaction({
      path: `m/44'/60'/${index}'`,
      transaction,
    });

    if (!status || error) {
      throw new Error(error || 'Bad Trezor response');
    }

    const sign = {
      r: payload.r,
      s: payload.s,
      v: payload.v,
    };

    const tx = new Tx({ ...transaction, ...sign });

    return `0x${tx.serialize().toString('hex')}`;
  }
}
