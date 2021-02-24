import _ from 'lodash';

export const validate = (validatorList, state, containEmail) => {
  let canSubmit = false;

  if (validatorList.length > 0) {
    _.map(validatorList, (item, i) => {
      let optional = item.optional;
      if (!optional) {
        let value = state[item.fieldName];

        if (!_.isEmpty(value)) {
          if (value.length > 0 || parseInt(value, 10) > 0 || parseFloat(value, 10) > 0) {
            if (!containEmail) {
              canSubmit = true;
            } else {
              if (item.type === 'email') {
                if (value.length > 0 && value.includes('@')) {
                  canSubmit = true;
                }
              }
            }
          }
        }
      }
    });
  }

  return canSubmit;
}
