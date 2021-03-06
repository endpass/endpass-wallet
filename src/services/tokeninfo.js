import { isAddress } from 'web3-utils';
import { http } from '@/class';

export default {
  getTokensList() {
    return this._getTokens().then(tokens =>
      tokens.map(this._parseToken).filter(this._checkAddress),
    );
  },

  // Get list of all tokens with infos
  _getTokens() {
    return http
      .get(`${ENV.VUE_APP_TOKEN_INFO_API_URL}/tokens`)
      .then(resp => resp.data);
  },
  // formats a token
  _parseToken(token) {
    return {
      ...token,
      logo: token.logo ? `${ENV.VUE_APP_TOKEN_IMAGE_URL}${token.logo}` : '',
    };
  },
  _checkAddress(token) {
    return isAddress(token.address);
  },
};
