export const HARDWARE_WALLET_TYPE = Object.freeze({
  TREZOR: 'TrezorAccount',
  LEDGER: 'LedgerAccount',
});

export const WALLET_TYPE = Object.freeze({
  PUBLIC: 'PublicAccount',
  HD_PUBLIC: 'HDPublicAccount',
  HD_MAIN: 'HDMainAccount',
  ...HARDWARE_WALLET_TYPE,
});
