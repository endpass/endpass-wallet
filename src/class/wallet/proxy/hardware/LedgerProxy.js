import Tx from 'ethereumjs-tx';
import HDKey from 'ethereumjs-wallet/hdkey';
import LedgerTransport from '@ledgerhq/hw-transport-u2f'; // for browser
import Eth from '@ledgerhq/hw-app-eth';
import { NotificationError } from '@/class/internal';
import web3 from '@/class/singleton/web3';
import { HARDWARE_DERIVIATION_PATH } from '@/constants';
import getChildrenAddress from '../utils/getChildrenAddress';

const { sha3, toHex } = web3.utils;

export default class LedgerProxy {
  static async getNextWallets({ offset = 0, limit = 10, xpub: savedXpub }) {
    try {
      const xpub = savedXpub || (await LedgerProxy.getPublicExtendedKey());
      const hdWallet = HDKey.fromExtendedKey(xpub);

      const addresses = getChildrenAddress(hdWallet, offset, limit);

      return { addresses, xpub };
    } catch (error) {
      if (error instanceof NotificationError) {
        throw error;
      }

      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    }
  }

  static async getPublicExtendedKey() {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);
      const { publicKey } = await eth.getAddress(ENV.hdKeyMnemonic.path);

      return publicKey;
    } catch (error) {
      console.log(error);
      let text =
        'An error occurred while getting access to hardware device. Please, try again.';

      if (error.message.includes('U2F')) {
        text = error.message;
      }

      throw new NotificationError({
        title: 'Access error',
        text,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }

  static async sign(message, index) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);

      const prefixedMessage = `\x19Ethereum Signed Message:\n${
        message.length
      }${message}`;
      const messageHash = sha3(prefixedMessage);

      const { r, s, v: vInt } = await eth.signPersonalMessage(
        `${HARDWARE_DERIVIATION_PATH}${index}`,
        Buffer.from(message).toString('hex'),
      );

      let vRaw = (vInt - 27).toString(16);

      if (vRaw.length < 2) {
        vRaw = `0${vRaw}`;
      }

      const v = vRaw === 27 || vRaw === 28 ? toHex(vInt) : toHex(vInt + 27);

      const signature = `0x${r}${s}${vRaw}`;

      return {
        message,
        messageHash,
        signature,
        r: `0x${r}`,
        s: `0x${s}`,
        v: `0x${v}`,
      };
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }

  static async signTransaction(transaction, index) {
    let transport;

    try {
      transport = await LedgerTransport.create();
      const eth = new Eth(transport);
      const tempTx = new Tx(transaction);

      const payload = await eth.signTransaction(
        `${HARDWARE_DERIVIATION_PATH}${index}`,
        `${tempTx.serialize().toString('hex')}`,
      );

      if (!payload) {
        throw new Error('Bad Trezor response');
      }

      const sign = {
        r: payload.r,
        s: payload.s,
        v: payload.v,
      };
      const tx = new Tx({ ...transaction, ...sign });

      return `0x${tx.serialize().toString('hex')}`;
    } catch (error) {
      console.log(error);
      throw new NotificationError({
        title: 'Access error',
        text: `An error occurred while getting access to hardware device. Please, try again.`,
        type: 'is-danger',
      });
    } finally {
      if (transport && transport.close) {
        await transport.close().catch(console.log);
      }
    }
  }

  static async recover(message, signature) {
    return web3.eth.accounts.recover(message, signature);
  }
}
