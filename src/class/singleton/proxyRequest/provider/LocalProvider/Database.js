import regPath from 'path-to-regexp';
import utils from './libs/utils';
import defRouteMethods from './libs/defRouteMethods';
import routes from './routes';

const routesRegexp = Object.keys(routes).reduce((res, key) => {
  res[key] = regPath(key);
  return res;
}, {});

export default class Database {
  constructor(url) {
    this.serverUrl = url;
  }

  async initRoutes() {
    const list = Object.keys(routes).filter(key => !!routes[key].init);
    await Promise.all(
      list.map(key => {
        const route = routes[key];
        return route.init(route);
      }),
    );
  }

  async request(params) {
    const { url, method } = params;
    if (method === 'clear') {
      return this.clear();
    }

    const path = utils.getPath(this.serverUrl, url);
    const routeKey = utils.getRouteKey(routesRegexp, path);
    if (!routeKey) {
      throw new Error(`not defined route key in ${path}`);
    }
    const route = routes[routeKey];
    const args = utils.getPathArgs(routesRegexp, routeKey, path);
    const routeMethod = route[method] || defRouteMethods[method];

    return routeMethod(route, args, params);
  }

  clear() {
    const map = {};
    const list = Object.keys(routes).filter(key => {
      const { table } = routes[key];
      const filtered = !map[table.name];
      map[table.name] = true;
      return filtered;
    });
    const tables = list.map(key => routes[key].table);
    return Promise.all(tables.map(table => table.clear()));
  }
}
