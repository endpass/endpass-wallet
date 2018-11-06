import { TrezorWallet, LedgerWallet } from '@/class';
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
        console.log(
          `default switch, can't match hardware type, given - ${walletType}`,
        );
        return TrezorWallet.getNextWallets(selectParams);
    }
  },
};
