export const successResponse = {
  success: true,
};

export const errorResponse = {
  success: false,
};

export const settings = {
  id: 'c23809bd-bb68-44a0-946c-40823dc4b80e',
  email: 'user@example.com',
  fiatCurrency: 'USD',
  otpEnabled: false,
  tokens: {
    1: [
      {
        address: '0x4E84E9e5fb0A972628Cf4568c403167EF1D40431',
        decimals: 18,
        logo: '',
        manuallyAdded: false,
        name: '$Fluzcoin',
        symbol: '$FFC',
      },
    ],
  },
};

export const networks = [
  {
    id: 1,
    currency: 1,
    name: 'Main',
    url: 'wss://eth-mainnet.endpass.com:2084',
  },
  {
    id: 3,
    name: 'Ropsten',
    currency: 2,
    url: 'http://eth-mainnet.endpass.com:2084',
  },
  {
    id: 4,
    name: 'Rinkeby',
    currency: 2,
    url: 'wss://eth-mainnet.endpass.com',
  },
  {
    id: 61,
    name: 'Ethereum classic',
    currency: 3,
    url: 'https://eth-mainnet.endpass.com',
  },
];

export const getPasswordRecoveryIdentifierResponse = {
  ...successResponse,
  message: '71d45eb3-480b-4034-9278-9a17eed20d49',
};

export const otpSecret = 'ASDASDASDASD'

export const verificationCode = '123456'

export const authenticatorCode = '654321'

export default {
  successResponse,
  errorResponse,
  settings,
  getPasswordRecoveryIdentifierResponse,
};
