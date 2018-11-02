import web3 from '@/utils/web3';

/**
 * Static copy of transaction class with the same methods
 */
export default class TransactionsUtils {
  static async isTransactionToContract(transaction) {
    const res = await web3.eth.getCode(transaction.to);

    return res !== '0x';
  }

  static getValidTo(transaction) {
    const { to } = transaction;

    if (!to) {
      return undefined;
    }

    if (/^0x/i.test(to)) {
      return to;
    }

    return `0x${to}`;
  }

  static getValidData(transaction) {
    const { data, tokenInfo, validTo, valueWei } = transaction;

    if (transaction.tokenInfo) {
      const erc20 = new ERC20Token(tokenInfo.address);
      const contract = erc20.getContract();

      return contract.methods.transfer(validTo, valueWei).encodeABI();
    }

    return data;
  }

  static getPriceWei(transaction) {
    if (!isNumeric(transaction.gasPrice)) return '0';

    return web3.utils.toWei(transaction.gasPrice, 'Gwei');
  }

  static async getFullPrice(transaction) {
    const estimationParams = {
      data: this.getValidData(transaction),
      to: this.getValidTo(transaction),
    };
    const estimatedGas = await web3.eth.estimateGas(estimationParams);
    const gasPriceWei = this.getPriceWei(transaction);

    return BigNumber(gasPriceWei)
      .times(estimatedGas)
      .toFixed();
  }
}
