![](https://github.com/endpass/endpass-wallet/workflows/wallet%20master/badge.svg?branch=master)
![](https://github.com/endpass/endpass-wallet/workflows/wallet%20release/badge.svg?branch=release)

# endpass-wallet

The first decentralized cloud wallet for Ethereum and ICO tokens.

### The "release" branch is the stable version of the wallet.
Log in to the wallet:

## [https://wallet.endpass.com](https://wallet.endpass.com)

## Developer Instructions

The wallet client is built with Vue.js and vue-cli, and can run a standard dev server.

You'll need to have `yarn` installed.

### Install

To install and start the local dev server on *http://localhost:8080*

```sh
git clone https://github.com/endpass/endpass-wallet
cd endpass-wallet
yarn install
yarn run dev
```

### Running Tests

There are two test suites: unit tests with Jest and end to end(e2e) intergation tests with cypress.

Run all unit tests:
```sh
yarn run unit
```

Run all end to end tests:
```sh
yarn run e2e
```

Open interactive e2e test console:
```sh
yarn run e2e:open
```
