import MockAdapter from 'axios-mock-adapter';

import { http } from '@/class/singleton';
import tokensFixture from 'fixtures/tokens';

const tokenInfo = require.requireActual('@/services/tokeninfo').default;

describe('token info service', () => {
  const { tokens } = tokensFixture;
  const tokensURL = `${ENV.tokenInfoAPIUrl}/tokens`;

  let mock;
  beforeEach(() => {
    mock = new MockAdapter(http);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should make correct request', async () => {
    expect.assertions(1);
    mock.onGet(tokensURL).reply(config => {
      expect(config.method).toBe('get');
      return [200, tokens];
    });
    await tokenInfo.getTokensList();
  });

  it('should get list of tokens', async () => {
    expect.assertions(1);
    mock.onGet(tokensURL).reply(200, tokens);
    const tokensList = await tokenInfo._getTokens();
    expect(tokensList).toEqual(tokens);
  });

  it('should parse token object', () => {
    let parsedToken = tokenInfo._parseToken(tokens[0]);
    // Also make sure it does not mutate the original tokens list
    expect(parsedToken.logo).toBe(`${ENV.tokenImageUrl}${tokens[0].logo}`);

    // This one does not have a logo
    parsedToken = tokenInfo._parseToken(tokens[1]);
    expect(parsedToken.logo).toBeFalsy();
  });

  it('should return parsed list of tokens', async () => {
    expect.assertions(3);
    mock.onGet(tokensURL).reply(200, tokens);
    const tokensList = await tokenInfo.getTokensList();
    expect(tokensList).toHaveLength(tokens.length);
    expect(tokensList[0].symbol).toBe(tokens[0].symbol);
    // Not equal because they are parsed
    expect(tokensList[0].logo).not.toBe(tokens[0].logo);
  });
  it('should filter wrong addresses', async () => {
    expect.assertions(2);
    const brokenToken = {
      address: 'kek',
    };
    mock.onGet(tokensURL).reply(200, [...tokens, brokenToken]);
    const tokensList = await tokenInfo.getTokensList();
    expect(tokensList).toHaveLength(tokens.length);
    expect(tokensList).not.toContain(brokenToken);
  });
});
