import itemsRequest from './itemsRequest';

function getId(route, args) {
  const { id } = route;
  const res = typeof id === 'function' ? id(args) : args[id];
  return res;
}

const defRouteMethods = {
  read(route, args) {
    if (!route.id) {
      return itemsRequest.itemsRead(route.table);
    }
    const id = getId(route, args);
    return itemsRequest.itemRead(route.table, { id });
  },
  add(route, args, params) {
    const id = getId(route, args);
    return itemsRequest.itemAdd(route.table, id, params.payload);
  },
  write(route, args, params) {
    const id = getId(route, args);
    return itemsRequest.itemWrite(route.table, id, params.payload);
  },
  remove(route, args, params) {
    const id = getId(route, args);
    return itemsRequest.itemRemove(route.table, { id }, params.payload);
  },
};

export default defRouteMethods;
