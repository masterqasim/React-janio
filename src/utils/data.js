export const VALID_CATEGORIES = [
  'Fashion Apparel',
  'Electronics',
  'Others',
  'Printed Matters',
  'Lifestyle Products',
]

export const findVal = (object, key) => {
  var value;
  Object.keys(object).some(function(k) {
      if (k === key) {
          value = object[k];
          return true;
      }
      if (object[k] && typeof object[k] === 'object') {
          value = findVal(object[k], key);
          return value !== undefined;
      }
  });
  return value;
}