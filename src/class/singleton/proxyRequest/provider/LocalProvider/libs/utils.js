import regPath from 'path-to-regexp';

const utils = {
  getRouteKey(routesRegexp, routePath) {
    return Object.keys(routesRegexp).find(key => {
      const re = routesRegexp[key];
      return re.test(routePath);
    });
  },
  getPath(serverUrl, url) {
    const levels = url.split(serverUrl);
    const keysPath = levels.pop() || '';
    const ret = keysPath[0] === '/' ? keysPath.substring(1) : keysPath;

    return ret;
  },
  getPathArgs(routesRegexp, key, routePath) {
    const keys = regPath.parse(key);
    const re = routesRegexp[key];
    re.lastIndex = 0; // drop exec position

    const values = re.exec(routePath);
    return keys.reduce((map, item, index) => {
      if (item && item.name) {
        map[item.name] = values[index];
      }
      return map;
    }, {});
  },
};

export default utils;
