import { toLower } from 'lodash';

export const makeConsistentToken = token => ({
  ...token,
  address: toLower(token.address),
});

export default {
  makeConsistentToken,
};
