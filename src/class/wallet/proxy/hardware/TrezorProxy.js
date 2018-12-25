import TrezorConnect from 'trezor-connect';
import Tx from 'ethereumjs-tx';
import HDKey from 'ethereumjs-wallet/hdkey';
import { NotificationError } from '@/class';
import { HARDWARE_DERIVIATION_PATH } from '@/constants';
import web3 from '@/class/singleton/web3';
import getChildrenAddress from '../utils/getChildrenAddress';

const { sha3, toHex, toDecimal } = web3.utils;

export default class TrezorProxy {
  static async getNextWallets({ offset = 0, limit = 10, xpub: savedXpub }) {
    try {
      const xpub = savedXpub || (await TrezorProxy.getPublicExtendedKey());
      const hdWallet = HDKey.fromExtendedKey(xpub);

      const addresses = getChildrenAddress(hdWallet, offset, limit);

      return { addresses, xpub };
    } catch (error) {
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    }
  }

  static async getPublicExtendedKey() {
    try {
      const { path } = ENV.hdKeyMnemonic;
      const {
        payload: { xpub },
      } = await TrezorConnect.getPublicKey({ path });

      return xpub;
    } catch (error) {
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    }
  }

  static async sign(message, index) {
    // \u0019 \x19
    const prefixedMessage = `\x19Ethereum Signed Message:\n${
      message.length
    }${message}`;
    const messageHash = sha3(prefixedMessage);
    const { success, payload } = await TrezorConnect.ethereumSignMessage({
      path: `${HARDWARE_DERIVIATION_PATH}${index}`,
      message,
    });

    if (!success) {
      throw new Error(payload.error || 'Bad Trezor response');
    }

    const { signature } = payload;
    const r = `0x${signature.slice(0, 64)}`;
    const s = `0x${signature.slice(64, 128)}`;
    const vInt = toDecimal(signature.slice(128, 130));
    const v = vInt === 27 || vInt === 28 ? toHex(vInt) : toHex(vInt + 27);

    return {
      message,
      messageHash,
      signature: `0x${signature}`,
      r,
      s,
      v,
    };
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

  static async recover(message, signature) {
    return web3.eth.accounts.recover(message, signature);
  }
}
