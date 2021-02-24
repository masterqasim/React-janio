import {
  FETCH_SUB_PROFILES,
  FETCH_SUB_PROFILE_BY_ID,
  ADD_SUB_PROFILE,
  EDIT_SUB_PROFILE,
  DELETE_SUB_PROFILE,
  CLEAR_SUB_PROFILES_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_SUB_PROFILES:
      return {
        ...state,
        errorData: action.errorData,
        subProfiles: action.payload,
        totalUsers: action.payload.length,
        totalPages: Math.ceil(action.payload.length/50),
        lastUpdated: moment()
      };
    case FETCH_SUB_PROFILE_BY_ID:
      return {
        ...state,
        errorData: action.errorData,
        subProfile: action.payload
      };
    case ADD_SUB_PROFILE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        lastUpdated: moment()
      };
    case EDIT_SUB_PROFILE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        lastUpdated: moment()
      };
    case DELETE_SUB_PROFILE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        lastUpdated: moment()
      };
    case CLEAR_SUB_PROFILES_ERRORS:
      return { ...state, error: null, errorData: null, subProfile: null };
    default:
      return state;
  }
}
