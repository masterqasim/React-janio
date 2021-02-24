import {
  FETCH_ITEM_DETAILS_WITH_FITLER,
  FETCH_ITEM_DETAILS_BY_ID,
  ADD_ITEM_DETAILS,
  UPDATE_ITEM_DETAILS_BY_ID,
  DELETE_ITEM_DETAILS_BY_ID,
  GET_ITEM_DETAILS_CSV,
  CLEAR_ITEM_DETAILS_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_ITEM_DETAILS_WITH_FITLER:
      return {
        ...state,
        itemDetails: action.payload.results,
        totalItemDetails: action.payload.count,
        totalPages: Math.ceil(action.payload.count/50),
        lastUpdated: moment()
      };
    case FETCH_ITEM_DETAILS_BY_ID:
      return {
        ...state,
        itemDetail: action.payload
      };
    case ADD_ITEM_DETAILS:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        lastUpdated: moment()
      };
    case UPDATE_ITEM_DETAILS_BY_ID:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        lastUpdated: moment()
      };
    case DELETE_ITEM_DETAILS_BY_ID:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        status: action.status,
        lastUpdated: moment()
      };
    case GET_ITEM_DETAILS_CSV:
      return {
        ...state,
        itemDetailsCSV: action.itemDetailsCSV,
        errorData: action.errorData,
      };
    case CLEAR_ITEM_DETAILS_ERRORS:
      return { ...state, error: null, errorData: null, status: null, itemDetailsCSV: [] };
    default:
      return state;
  }
}
