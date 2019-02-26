import { ProxyRequest } from '@endpass/class';
import httpIdentity from './httpIdentity';

export default new ProxyRequest(httpIdentity, ENV.identityAPIUrl);
