import TrezorConnect from 'trezor-connect';
import Tx from 'ethereumjs-tx';
import { NotificationError } from '@/class';
import { HARDWARE_DERIVIATION_PATH } from '@/constants';

export default class TrezorWallet {
  static async getNextWallets({ offset = 0, limit = 10 }) {
    try {
      const bundleParams = [...Array(limit)].map((_, i) => ({
        path: `${HARDWARE_DERIVIATION_PATH}${offset + i}`,
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
    const { payload } = await TrezorConnect.ethereumSignTransaction({
      path: `${HARDWARE_DERIVIATION_PATH}${index}`,
      transaction,
    });

    if (payload.error) {
      throw new Error(payload.error || 'Bad Trezor response');
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
