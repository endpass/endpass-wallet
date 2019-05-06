import EndpassConnect from '@endpass/connect';

const connect = new EndpassConnect({
  authUrl: ENV.VUE_APP_CONNECT_URL,
  isIdentityMode: true,
  widget: false,
  showCreateAccount: false,
});

export default connect;
