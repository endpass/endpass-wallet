const itemsRequest = {
  getItemData(list) {
    return list.map(node => node.data);
  },
  itemsRead(table) {
    return table.toArray(list => itemsRequest.getItemData(list));
  },
  itemRead(table, whereExp) {
    return new Promise((resolve, reject) => {
      table
        .where(whereExp)
        .first(
          node =>
            node && node.data ? resolve(node.data) : reject('Data is empty'),
        )
        .catch(reject);
    });
  },
  itemRemove(table, whereExp) {
    return table.where(whereExp).delete();
  },
  itemWrite(table, id, payload) {
    // scheme default for all tables
    return table.put({
      id,
      data: payload,
    });
  },
  async itemAdd(table, id, payload) {
    const stored = {};
    try {
      const res = await itemsRequest.itemRead(table, { id });
      Object.assign(stored, res || {});
    } catch (e) {}

    const pushData = {
      id,
      data: {
        ...stored,
        ...payload,
      },
    };
    return table.put(pushData);
  },
};

export default itemsRequest;
