import Bip39 from 'bip39';

jest.mock('bip39', () => ({
  mnemonicToSeed: jest.fn(seedPhrase => seedPhrase),
}));

export default Bip39;
