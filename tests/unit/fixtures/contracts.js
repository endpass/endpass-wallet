export const fakeContract = {
  methods: {
    balanceOf: () => ({
      call: () => Promise.resolve('balanceOf'),
    }),
    name: () => ({
      call: () => Promise.resolve('name'),
    }),
    symbol: () => ({
      call: () => Promise.resolve('symbol'),
    }),
    decimals: () => ({
      call: () => Promise.resolve('decimals'),
    }),
  },
};

export const fakeEmptyContract = {
  methods: {
    balanceOf: () => ({
      call: () => Promise.reject(),
    }),
    name: () => ({
      call: () => Promise.reject(),
    }),
    symbol: () => ({
      call: () => Promise.reject(),
    }),
    decimals: () => ({
      call: () => Promise.reject(),
    }),
  },
};

export default {
  fakeContract,
  fakeEmptyContract,
};
