import web3 from '@/utils/web3';
import { http } from '@/class/singleton';

export default {
  getTokensList() {
    return this._getTokens().then(tokens =>
      tokens.map(this._parseToken).filter(this._checkAddress),
    );
  },

  // Get list of all tokens with infos
  _getTokens() {
    return http.get(`${ENV.tokenInfoAPIUrl}/tokens`).then(resp => resp.data);
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
