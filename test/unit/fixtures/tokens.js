// List of ERC20 tokens with information
const tokens = [
  {
    name: 'First Token',
    symbol: 'FST',
    address: '0x4Ce2109f8DB1190cd44BC6554E35642214FbE144',
    decimals: 18,
    logo: '/img/FST.png',
  },
  {
    name: 'second token',
    symbol: 'SCDT',
    address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    decimals: 8,
    logo: '',
  },
];

// Tokens keyed by address, like in store.tokens.allTokens
const allTokens = tokens.reduce((obj, item) => {
  obj[item.address] = item;
  return obj;
}, {});

export default {
  tokens,
  allTokens,
};
