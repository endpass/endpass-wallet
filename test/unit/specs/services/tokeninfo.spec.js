import MockAdapter from 'axios-mock-adapter';
import { tokenInfoAPIUrl, tokenImageUrl } from '@/config';
import tokenInfo from '@/services/tokeninfo';
import tokensFixture from 'fixtures/tokens';

describe('token info service', () => {
  const tokens = tokensFixture.tokens;

  let mock;
  beforeEach(() => {
    mock = new MockAdapter(tokenInfo.http);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should get list of tokens', async () => {
    mock.onGet(`${tokenInfoAPIUrl}/tokens`).reply(200, tokens);
    let tokensList = await tokenInfo._getTokens();
    expect(tokensList).toEqual(tokens);
  });

  it('should parse token object', () => {
    let parsedToken = tokenInfo._parseToken(tokens[0]);
    // Also make sure it does not mutate the original tokens list
    expect(parsedToken.logo).toBe(`${tokenImageUrl}${tokens[0].logo}`);

    // This one does not have a logo
    parsedToken = tokenInfo._parseToken(tokens[1]);
    expect(parsedToken.logo).toBeFalsy();
  });
});
