import EndpassConnect from '@endpass/connect';

const connect = new EndpassConnect({
  authUrl: ENV.connectUrl,
  isIdentityMode: true,
});

export default connect;
