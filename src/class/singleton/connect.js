import EndpassConnect from '@endpass/connect';
import AuthPlugin from '@endpass/connect/auth';
import WalletPlugin from '@endpass/connect/wallet';

const connect = new EndpassConnect({
  authUrl: ENV.VUE_APP_CONNECT_URL,
  isIdentityMode: true,
  plugins: [AuthPlugin, WalletPlugin],
});

export default connect;
