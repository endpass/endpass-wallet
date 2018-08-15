import { Wallet } from '@/class';
import accountsFixture from 'fixtures/accounts';

const { v3, v3password, privateKey } = accountsFixture;

describe('Wallet Class', () => {
  it('should create instance with API format', () => {
    const wallet = new Wallet(v3);
    expect(wallet.v3).toEqual(v3);
  });

  describe('instance methods', () => {
    describe('signTransaction', () => {
      it('should call sign function with private key', async () => {
        const wallet = new Wallet(v3);
        const transaction = { sign: jest.fn() };
        wallet.getPrivateKey = jest.fn().mockResolvedValue(privateKey);

        await wallet.signTransaction(transaction, v3password);

        expect(transaction.sign).toBeCalledWith(privateKey);
      });
    });
  });
});
