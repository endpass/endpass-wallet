export const transactionHash =
  '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a7';

export const shortTransactionHash = '0x63...42a7';

export const signedTransactionHash =
  '0xd8d5809a2223a1ced2cb76064a5e1d3b08053dbad88dbbb09096d090364c5bbb64d3536e80c5f4bab16528fcb8020705ea5d53ff893621bce81635684dc3a6511c';

export const transaction = {
  tokenInfo: null,
  gasPrice: '40',
  gasLimit: '22000',
  nonce: 0,
  value: '0',
  to: '',
  data: '0x',
};

export const metamaskTransaction = {
  blockHash:
    '0x3ab5a03331eb5301f8562ab05aab7503ca692216e16e7dea27d8117eb1a3add1',
  blockNumber: 4707534,
  chainId: '0x3',
  condition: null,
  creates: null,
  from: '0x56232EdcC87984206eEAB89b4C204cE02fdD7CC7',
  gas: 21000,
  gasPrice: '20000000000',
  hash: '0x7eb98e91c2dc16347709b996d4898ba4d1a4cfdeb9d23f03ef32fcbe26e4ec63',
  input: '0x',
  nonce: 13,
  publicKey:
    '0x8219700cce9f8e1b70ddef6cb7943c0495d1c70d7f4216fa69569bb173a037d141e2a962ebaaca58fee2fbf15243ebaadc919148e53627501a34350529779cc1',
  r: '0x39c0faaaa17f8d5d0cf4f6312b446122027725d8c04bdada657dee77950fcdf1',
  raw:
    '0xf86b0d8504a817c80082520894aef74e25181b0879d293396dd9949cf25b339407872386f26fc100008029a039c0faaaa17f8d5d0cf4f6312b446122027725d8c04bdada657dee77950fcdf1a01278f4fabc5700478af5ff8ce3ee758a557afc355ea156fdb50a6be9ccf5e3cf',
  s: '0x1278f4fabc5700478af5ff8ce3ee758a557afc355ea156fdb50a6be9ccf5e3cf',
  standardV: '0x0',
  to: '0xaEF74e25181b0879d293396Dd9949Cf25b339407',
  transactionIndex: 0,
  v: '0x29',
  value: '10000000000000000',
};

export const paramsTransaction = {
  value: '0x2',
  gasPrice: '0x2',
};

export const ethplorerHistory = [
  {
    timestamp: 1535036970,
    transactionHash:
      '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a7',
    tokenInfo: {
      address: '0x2aec18c5500f21359ce1bea5dc1777344df4c0dc',
      name: 'FarmaTrust',
      decimals: '18',
      symbol: 'FTT',
      totalSupply: '1000000000000000000000000000',
      owner: '0xc3808aa176ec1ca6bbecb593be1d494762094158',
      txsCount: 6206,
      transfersCount: 5899,
      lastUpdated: 1519886541914,
      issuancesCount: 0,
      holdersCount: 4630,
      image: 'https://ethplorer.io/images/farmatrust.png',
      website: 'http://farmatrust.io',
      ethTransfersCount: 0,
      price: false,
    },
    type: 'transfer',
    value: '50000000000000000000',
    from: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
    to: '0xc761c758f10c84bb2af14ec728780372af840ce7',
  },
  {
    timestamp: 1535036944,
    transactionHash:
      '0xe03f54be853b798e40ebc12b96050ab9624fd95d6750e043f306f247132998a7',
    tokenInfo: {
      address: '0x2aec18c5500f21359ce1bea5dc1777344df4c0dc',
      name: 'FarmaTrust',
      decimals: '18',
      symbol: 'FTT',
      totalSupply: '1000000000000000000000000000',
      owner: '0xc3808aa176ec1ca6bbecb593be1d494762094158',
      txsCount: 6206,
      transfersCount: 5899,
      lastUpdated: 1519886541914,
      issuancesCount: 0,
      holdersCount: 4630,
      image: 'https://ethplorer.io/images/farmatrust.png',
      website: 'http://farmatrust.io',
      ethTransfersCount: 0,
      price: false,
    },
    type: 'transfer',
    value: '50000000000000000000',
    from: '0x490976966cea5e2403532f17e9dc531536734a2f',
    to: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
  },
];

export const ethplorerTransactions = [
  {
    timestamp: 1535035155,
    from: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
    to: '0x9ECEEfDF3554E178a6549006F2C02163E63C9fd8',
    hash: '0x53d26efcde07f1b2b68f3e1de93b730deabd1094970d9a68efb799e048e00892',
    value: 0.048671,
    input: '0x',
    success: true,
    state: 'success',
    date: new Date(1535035155 * 1000),
  },
  {
    timestamp: 1534823940,
    from: '0xb2930b35844a230f00e51431acae96fe543a0347',
    to: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
    hash: '0x1cfa3ef1695ab8035ff9abbee0637a8948af3c787b28341cc12a9a5bbb894555',
    value: 0.04952236,
    input: '0x',
    success: true,
  },
];

export const pendingTransactions = [
  {
    to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
    from: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    token: 'ETH',
    networkId: 2,
    state: 'pending',
    value: '2',
    gasPrice: '2',
    hash: '0xea9ac0110e2cab67d43188375acfe4f474b20ca5453a4eb68d9089bb9a9e40f3',
  },
  {
    to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
    from: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    token: 'ETH',
    networkId: 1,
    state: 'pending',
    value: '2',
    gasPrice: '1',
    hash: '0x766a342b3e1f460d768873e8f1b1867097bbf2ca78425dd3c9a924aa5e83637a',
  },
  {
    to: '0x1de2109f8db1190cd44bc6554e35642214fbe144',
    from: '0x4de2109f8db1190cd44bc6554e35642214fbe144',
    token: 'ETH',
    networkId: 2,
    state: 'success',
    value: '2',
    gasPrice: '1',
    date: new Date('01/03/2001'),
    hash: '0xe595e9c4b7188dc5bd7efcd39c1704f3507cad6c53d2ef01889942e7c0e6c8ef',
  },
  {
    to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
    from: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    token: 'ETH',
    networkId: 1,
    state: 'pending',
    value: '1',
    gasPrice: '2',
    date: new Date('01/01/2001'),
    hash: '0x9d92b835d8b9fab8c27d45045ed61d728ec6280c60b792b2a623ad600d911261',
  },
  {
    to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
    from: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    token: null,
    networkId: 1,
    state: 'pending',
    value: '1',
    gasPrice: '2',
    date: new Date('01/01/2001'),
    hash: '0x9d92b835d8b9fab8c27d45045ed61d728ec6280c60b792b2a623ad600d911262',
  },
  {
    to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
    from: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    token: 'ETH-TEST',
    networkId: 1,
    state: 'pending',
    value: '1',
    gasPrice: '2',
    date: new Date('01/01/2001'),
    hash: '0x9d92b835d8b9fab8c27d45045ed61d728ec6280c60b792b2a623ad600d911263',
  },
];

export const blockTransactions = [
  {
    blockHash:
      '0xea9ac0110e2cab67d43188375acfe4f474b20ca5453a4eb68d9089bb9a9e40f3',
    blockNumber: 4261473,
    from: '0xE824633E6d247e64ba2cD841D8270505770d53fE',
    gas: 22000,
    gasPrice: '12000000000',
    hash: '0x376d2f6b2e0a0bf6956c94a02c4db6fd6442f1d2b6f536140328483278c99dab',
    input: '0x',
    nonce: 594,
    to: '0xB14Ab53E38DA1C172f877DBC6d65e4a1B0474C3c',
    transactionIndex: 1,
    value: '1000000000000000',
    chainId: '0x3',
  },
  {
    blockHash:
      '0x8996edfe2b61f6f1bfb9d51c0c9536ef3e8ef57559170b263af821c6a170e1dc',
    blockNumber: 4261472,
    from: '0x9ECEEfDF3554E178a6549006F2C02163E63C9fd8',
    gas: 22000,
    gasPrice: '12000000000',
    hash: '0x376d2f6b2e0a0bf6956c94a02c4db6fd6442f1d2b6f536140328483278c99dab',
    input: '0x',
    nonce: 593,
    to: '0xE824633E6d247e64ba2cD841D8270505770d53fE',
    value: '1000000000000000',
    chainId: '0x3',
  },
];

export default {
  transaction,
  transactionHash,
  signedTransactionHash,
  shortTransactionHash,
  blockTransactions,
  ethplorerHistory,
  ethplorerTransactions,
  pendingTransactions,
};
