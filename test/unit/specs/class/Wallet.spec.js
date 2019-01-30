import Tx from 'ethereumjs-tx';
import { Wallet } from '@/class';
import { v3, v3password, privateKey } from 'fixtures/accounts';

describe('Wallet Class', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet(v3);
  });

  it('should create instance with API format', () => {
    expect(wallet.v3).toEqual(v3);
  });

  describe('instance methods', () => {
    describe('signTransaction', () => {
      const transaction = new Tx();

      transaction.sign = jest.fn();

      it('should call sign function with private key and return transaction rlp hash', async () => {
        expect.assertions(3);

        wallet.getPrivateKey = jest.fn().mockResolvedValue(privateKey);

        const signedTx = await wallet.signTransaction(transaction, v3password);

        expect(transaction.sign).toBeCalledWith(privateKey);
        expect(signedTx).toEqual(expect.any(String));
        expect(/^0x\S+/.test(signedTx)).toBeTruthy();
      });
    });

    describe('exportToJSON', () => {
      it('should return the correct v3 json string', async () => {
        const v3Str = await wallet.exportToJSON();
        const v3Export = JSON.parse(v3Str);

        expect(v3Export).toEqual(v3);
      });
    });
  });
});
