const pathById = {
  "m/44'/1'/0'/0": [3, 4, 20, 28, 42, 60, 64, 820, 1987, 31102, 7762959],
  "m/44'/40'/0'/0": [2],
  "m/44'/60'/0'/0": [1, 99],
  "m/44'/61'/0'/0": [61],
  "m/44'/108'/0'/0": [8],
  "m/44'/164'/0'/0": [3125659152],
  "m/44'/200625'/0'/0": [200625],
  "m/44'/1313114'/0'/0": [1313114],
};

const netIds = Object.values(pathById).reduce((acc, val) => [...acc, ...val]);

if (netIds.length !== new Set(netIds).size) {
  throw new Error('Only unique network IDs');
}

const netIdWithPath = netIds.reduce((acc, netId) => {
  Object.entries(pathById).forEach(([key, values]) => {
    if (values.includes(netId)) {
      Object.assign(acc, { [netId]: key });
    }
  });

  return acc;
}, {});

export default netIdWithPath;
