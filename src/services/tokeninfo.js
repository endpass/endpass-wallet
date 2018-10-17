import axios from 'axios';
import web3 from '@/utils/web3';

export default {
  // Axios instance for this service
  http: axios.create({
    baseURL: ENV.tokenInfoAPIUrl,
    timeout: 15000,
  }),

  getTokensList() {
    return this._getTokens().then(tokens =>
      tokens.map(this._parseToken).filter(this._checkAddress),
    );
  },

  // Get list of all tokens with infos
  _getTokens() {
    return this.http.get(`/tokens`).then(resp => resp.data);
  },
  // formats a token
  _parseToken(token) {
    return {
      ...token,
      logo: token.logo ? `${ENV.tokenImageUrl}${token.logo}` : '',
    };
  },
  _checkAddress(token) {
    return web3.utils.isAddress(token.address);
  },
};
