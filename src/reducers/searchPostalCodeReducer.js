import {
  FETCH_POSTAL_SEARCH,
  CLEAR_SEARCH_POSTAL_CODE_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_POSTAL_SEARCH:
      return {
        ...state,
        postalSearch: action.payload,
        lastUpdated: moment()
      };
    case CLEAR_SEARCH_POSTAL_CODE_ERRORS:
      return { ...state, error: null, errorData: null, postalSearch: null };
    default:
      return state;
  }
}
