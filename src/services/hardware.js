import { TrezorWallet } from '@/class';
import { WALLET_TYPE } from '@/constants';

export default {
  getNextWallets({ walletType, ...selectParams }) {
    switch (walletType) {
      case WALLET_TYPE.TREZOR:
        return TrezorWallet.getNextWallets(selectParams);

      default:
        return TrezorWallet.getNextWallets(selectParams);
    }
  },
};
