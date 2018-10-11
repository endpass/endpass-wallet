import MockAdapter from 'axios-mock-adapter';
import { tokenInfoAPIUrl, tokenImageUrl } from '@/config';
import tokensFixture from 'fixtures/tokens';

const tokenInfo = require.requireActual('@/services/tokeninfo').default;

describe('token info service', () => {
  const { tokens } = tokensFixture;
  const tokensURL = `${tokenInfoAPIUrl}/tokens`;

  let mock;
  beforeEach(() => {
    mock = new MockAdapter(tokenInfo.http);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should make correct request', async () => {
    mock.onGet(tokensURL).reply(config => {
      expect(config.method).toBe('get');
      expect(config.baseURL).toBe(tokenInfoAPIUrl);
      expect(config.url).toBe('/tokens');
      return [200, tokens];
    });
    await tokenInfo.getTokensList();
  });

  it('should get list of tokens', async () => {
    mock.onGet(tokensURL).reply(200, tokens);
    const tokensList = await tokenInfo._getTokens();
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

  it('return parsed list of tokens', async () => {
    mock.onGet(tokensURL).reply(200, tokens);
    const tokensList = await tokenInfo.getTokensList();
    expect(tokensList).toHaveLength(tokens.length);
    expect(tokensList[0].symbol).toBe(tokens[0].symbol);
    // Not equal because they are parsed
    expect(tokensList[0].logo).not.toBe(tokens[0].logo);
  });
});
