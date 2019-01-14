export default function injectWeb3(mod) {
  return function(web3) {
    mod.web3 = web3;
    return mod;
  };
}
