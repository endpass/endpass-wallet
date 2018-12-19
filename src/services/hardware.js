import { TrezorWallet, LedgerWallet, NotificationError } from '@/class';
import { WALLET_TYPE } from '@/constants';

export default {
  getNextWallets({ walletType, ...selectParams }) {
    console.log(walletType);
    switch (walletType) {
      case WALLET_TYPE.TREZOR:
        return TrezorWallet.getNextWallets(selectParams);

      case WALLET_TYPE.LEDGER:
        console.log('get from ledger');
        return LedgerWallet.getNextWallets(selectParams);

      default:
        console.warn(`Can't match hardware type ${walletType}`);
        throw new NotificationError({
          title: 'Access error',
          text: `An error occurred while getting access to hardware device. Please, try again.`,
          type: 'is-danger',
        });
    }
  },
};
