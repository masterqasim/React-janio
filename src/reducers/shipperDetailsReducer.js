import {
  FETCH_LANGUAGES,
  FETCH_SHIPPER_DETAILS,
  EDIT_SHIPPER_DETAILS,
  CLEAR_SHIPPER_DETAILS_ERRORS
} from '../actions/types';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_LANGUAGES:
      return { ...state, languages: action.payload };
    case FETCH_SHIPPER_DETAILS:
      return { ...state, shipperDetails: action.payload };
    case EDIT_SHIPPER_DETAILS:
      return { ...state, error: action.payload };
    case CLEAR_SHIPPER_DETAILS_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
}
