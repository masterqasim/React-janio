import {
  SUBMIT_REGISTER,
  REGISTER_ACCOUNT,
  CLEAR_REGISTER_ERRORS
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case SUBMIT_REGISTER:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData
      };
    case REGISTER_ACCOUNT:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        permissionUrl: action.permissionUrl
      };
    case CLEAR_REGISTER_ERRORS:
      return { ...state, error: null, errorData: null, permissionUrl: null };
    default:
      return state;
  }
}
