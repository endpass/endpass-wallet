export const pendingTransactions = {
  filterId: 1,
  transactions: [
    {
      from: '0x3a0118a93c1d9b2bcadd2440ab5a245864772f58',
      gas: '0x5208',
      gasPrice: '0xee6b2800',
      hash:
        '0xa88d85593e69cf25a642cb7a257ff03a69ff7aba11aa654dfb34d6876a41d2c5',
      input: '0x',
      nonce: '0x17',
      r: '0xb7913b6e727546bffc18617ff0701d8ec6b62986184dd6a83c9236b138f4947e',
      s: '0x67651ba6a7edaa98b9b4a651432655b398d108d8cbcc4b7d8762a56ce18b2753',
      to: '0x3a0118a93c1d9b2bcadd2440ab5a245864772f58',
      v: '0x29',
      value: '0x16345785d8a0000',
      chainId: '0x3',
      timestamp: '0x5c614ba1',
    },
  ],
};

export const emptyPendingTransactions = {
  filterId: 1,
  transactions: [],
};

export const cryptoDataHistory = [
  {
    timestamp: 1535036970,
    hash: '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a7',
    token: {
      address: '0x2aec18c5500f21359ce1bea5dc1777344df4c0dc',
      name: 'FarmaTrust',
      decimals: '18',
      symbol: 'FTT',
      logo: 'https://ethplorer.io/images/farmatrust.png',
    },
    type: 'transfer',
    value: '50000000000000000000',
    from: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
    to: '0xc761c758f10c84bb2af14ec728780372af840ce7',
  },
  {
    timestamp: 1535036944,
    hash: '0xe03f54be853b798e40ebc12b96050ab9624fd95d6750e043f306f247132998a7',
    token: {
      address: '0x2aec18c5500f21359ce1bea5dc1777344df4c0dc',
      name: 'FarmaTrust',
      decimals: '18',
      symbol: 'FTT',
      logo: 'https://ethplorer.io/images/farmatrust.png',
      price: false,
    },
    type: 'transfer',
    value: '50000000000000000000',
    from: '0x490976966cea5e2403532f17e9dc531536734a2f',
    to: '0xb14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
  },
];
