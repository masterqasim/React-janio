import {
  FETCH_STORE,
  FETCH_STORE_BY_ID,
  FETCH_STORE_TYPES,
  ADD_STORE,
  DELETE_STORE,
  ACTIVATE_STORE,
  DEACTIVATE_STORE,
  FETCH_PREVIOUS,
  FETCH_NEXT,
  FETCH_STORE_ORDER_BY_FILTER,
  FETCH_STORE_ORDER_DETAILS,
  FETCH_POSTAL_IDENTIFIER,
  CLEAR_STORE_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_STORE:
      return {
        ...state,
        stores: action.payload,
        errorData: action.errorData
      };
    case FETCH_STORE_BY_ID:
      return {
        ...state,
        store: action.payload,
        errorData: action.errorData
      };
    case FETCH_STORE_TYPES:
      return { ...state, storeTypes: action.payload };
    case ADD_STORE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData
      };
    case DELETE_STORE:
      return {
        ...state,
        error: action.payload,
        status: action.status,
        lastUpdated: moment()
      };
    case ACTIVATE_STORE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        status: action.status,
        message: 'Activate store success!',
        lastUpdated: moment()
      };
    case DEACTIVATE_STORE:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        status: action.status,
        message: 'Deactivate store success!',
        lastUpdated: moment()
      };
    case FETCH_PREVIOUS:
      return { ...state };
    case FETCH_NEXT:
      return { ...state };
    case FETCH_STORE_ORDER_BY_FILTER:
      return {
        ...state,
        storeOrder: action.payload,
        totalOrders: action.payload.length,
        totalPages: Math.ceil(action.payload.length/50),
        lastUpdated: moment(),
        errorData: action.errorData
      };
    case FETCH_STORE_ORDER_DETAILS:
      return {
        ...state,
        storeOrderDetails: action.payload,
        errorData: action.errorData
      };
    case FETCH_POSTAL_IDENTIFIER:
      return { ...state, postalIdentifier: action.payload };
    case CLEAR_STORE_ERRORS:
      return { ...state, error: null, errorData: null, status: null, message: null };
    default:
      return state;
  }
}
