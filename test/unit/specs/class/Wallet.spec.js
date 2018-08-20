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
      it('should call sign function with private key', async () => {
        const transaction = { sign: jest.fn() };
        wallet.getPrivateKey = jest.fn().mockResolvedValue(privateKey);

        await wallet.signTransaction(transaction, v3password);

        expect(transaction.sign).toBeCalledWith(privateKey);
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
