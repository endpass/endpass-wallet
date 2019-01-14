import { Token } from '../internal';
import Convertor from './Convertor';

const propsMethods = {
  value: Convertor.toStringFloat,
  gasPrice: Convertor.toStringFloat,
  to: Convertor.toAddress,
  from: Convertor.toAddress,
};

function setProp(trx, key, value) {
  const method = propsMethods[key];
  if (method) {
    trx[key] = method(value);
  } else if (trx.hasOwnProperty(key)) {
    trx[key] = value;
  } else {
    console.warn('Trying to apply not defined key in trx structure');
  }
}

export default function applyProps(trx, newProps) {
  // apply first props if they defined, then call others
  const nextProps = { ...newProps };

  // must set before other props. Other props have dependency from tokenInfo value
  if (nextProps.hasOwnProperty('tokenInfo')) {
    trx.tokenInfo = nextProps.tokenInfo && Token.asObject(nextProps.tokenInfo);
    delete nextProps.tokenInfo;
  }

  for (const key in nextProps) {
    setProp(trx, key, nextProps[key]);
  }

  Object.freeze(trx);
  return trx;
}
