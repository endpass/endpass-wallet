import axios from 'axios';

export default {
  // Axios instance for this service
  http: axios.create({
    baseURL: env.tokenInfoAPIUrl,
    timeout: 15000,
  }),

  getTokensList() {
    return this._getTokens().then(tokens => tokens.map(this._parseToken));
  },

  // Get list of all tokens with infos
  _getTokens() {
    return this.http.get(`/tokens`).then(resp => resp.data);
  },
  // formats a token
  _parseToken(token) {
    return {
      ...token,
      logo: token.logo ? `${env.tokenImageUrl}${token.logo}` : '',
    };
  },
};
