import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR,
  FETCH_SIGNED_IN_USER,
  EDIT_SIGNED_IN_USER,
  CHANGE_PASSWORD,
  RESET_PASSWORD,
  PASSWORD_SENT,
  CLEAR_AUTH_ERRORS
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case AUTH_USER:
      return {
        ...state,
        error: null,
        authenticated: true
      };
    case UNAUTH_USER:
      return { authenticated: false };
    case AUTH_ERROR:
      return { ...state, error: true };
    case FETCH_SIGNED_IN_USER:
      return { ...state, user: action.payload };
    case EDIT_SIGNED_IN_USER:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        editType: action.editType
      };
    case CHANGE_PASSWORD:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        editType: action.editType
      };
    case RESET_PASSWORD:
      return { ...state, error: action.payload };
    case PASSWORD_SENT:
      return { ...state, error: action.payload };
    case CLEAR_AUTH_ERRORS:
      return { ...state, error: null, errorData: null, permissionUrl: null };
    default:
      return state;
  }
}
