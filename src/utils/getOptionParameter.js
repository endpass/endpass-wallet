export default function getOptionParameter(item, value) {
  return item instanceof Object ? item[value] : item;
}
