import HDKey from 'ethereumjs-wallet/hdkey';
import { NotificationError } from '../../internal';
import getChildrenAddress from './utils/getChildrenAddress';

export default class HDProxy {
  static async getNextWallets({ offset = 0, limit = 10, xpub }) {
    try {
      const hdWallet = HDKey.fromExtendedKey(xpub);
      const addresses = getChildrenAddress(hdWallet, offset, limit);

      return { addresses, xpub };
    } catch (error) {
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to HD. Please, try again.`,
        type: 'is-danger',
      });
    }
  }
}
