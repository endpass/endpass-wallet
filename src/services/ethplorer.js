import axios from 'axios'

export default {
  getTransactions(address) {
    return axios.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`)
  },
  getInfo(address) {
    return axios.get(`https://api.ethplorer.io/getAddressTransactions/${address}`, {
      params: {
        limit: 50,
        apiKey: 'freekey'
      }
    })
  }
}
