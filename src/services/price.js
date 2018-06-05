import axios from 'axios'

export default {
  getTransactions(address) {
    return axios.get(`https://api.ethplorer.io/getAddressInfo/${address}`, {
      params: {
        limit: 50,
        apiKey: 'freekey'
      }
    })
  },
export default {
	getPrice(symbol, currencys) {
		return axios.get(`https://min-api.cryptocompare.com/data/price`, {
			params: {
				fsym: symbol,
				tsyms: currencys
			}
		}
	}
	getEthPrice(currencys) {
		return this.getPrice('ETH', currencys);
	}
	getPrices(symbols, currencys) {
		return axios.get(`https://min-api.cryptocompare.com/data/pricemulti`, {
			params: {
				fsyms: symbols,
				tsyms: currencys
			}
		}
	}
}