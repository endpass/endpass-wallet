import HDKey from 'ethereumjs-wallet/hdkey';

jest.mock('ethereumjs-wallet/hdkey', () => {
  const getPrivateKey = jest.fn();
  const getAddress = jest.fn();
  const getChecksumAddressString = jest.fn();
  const toV3 = jest.fn();
  const publicExtendedKey = jest.fn();
  const getWallet = jest.fn(() => ({
    getPrivateKey,
    getAddress,
    getChecksumAddressString,
    toV3,
  }));
  const deriveChild = jest.fn(() => ({ getWallet }));
  const derivePath = jest.fn(() => ({
    deriveChild,
    publicExtendedKey,
  }));
  const mockHdKey = {
    fromMasterSeed: jest.fn(() => ({
      derivePath,
    })),
    fromExtendedKey: jest.fn(() => ({
      deriveChild,
      getWallet,
    })),
  };

  mockHdKey.getPrivateKey = getPrivateKey;
  mockHdKey.getAddress = getAddress;
  mockHdKey.getChecksumAddressString = getChecksumAddressString;
  mockHdKey.toV3 = toV3;
  mockHdKey.getWallet = getWallet;
  mockHdKey.deriveChild = deriveChild;
  mockHdKey.derivePath = derivePath;
  mockHdKey.publicExtendedKey = publicExtendedKey;

  return mockHdKey;
});

export default HDKey;
