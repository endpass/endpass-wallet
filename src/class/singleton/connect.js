import EndpassConnect from '@endpass/connect';

const connect = new EndpassConnect({
  authUrl: ENV.connectUrl,
});

export default connect;
