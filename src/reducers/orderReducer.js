import {
  FETCH_SERVICE,
  FETCH_ALL_COUNTRIES,
  FETCH_ITEM_CATEGORY,
  FETCH_ITEM_PRICE_CURRENCY,
  FETCH_CONVERTED_VALUE,
  FETCH_STATUSES,
  FETCH_UPLOAD_BATCH_NO,
  ADD_ORDER,
  EDIT_ORDER,
  ADD_ORDERS,
  FETCH_ORDERS_BY_SECRET_KEY,
  FETCH_PREVIOUS,
  FETCH_NEXT,
  FETCH_ORDERS_BY_FILTER,
  FETCH_ORDER_DETAILS,
  DELETE_ORDER,
  ORDERS_ACTION_ERROR,
  CLEAR_ORDER_ERRORS,
  FETCH_PARKERS,
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_SERVICE:
      return { ...state, service: action.payload };
    case FETCH_PARKERS:
      return { ...state, parkers: action.payload };
    case FETCH_ALL_COUNTRIES:
      return { ...state, countries: action.payload };
    case FETCH_ITEM_CATEGORY:
      return { ...state, itemCategory: action.payload };
    case FETCH_ITEM_PRICE_CURRENCY:
      return { ...state, itemPriceCurrency: action.payload };
    case FETCH_CONVERTED_VALUE:
      return { ...state, convertedValueList: action.payload };
    case FETCH_STATUSES:
      return { ...state, statuses: action.payload };
    case FETCH_UPLOAD_BATCH_NO:
      return { ...state, updateBatchNo: action.payload };
    case ADD_ORDER:
      return { ...state, error: action.payload, errorData: action.errorData };
    case EDIT_ORDER:
      return { ...state, error: action.payload };
    case ADD_ORDERS:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        status: action.status,
        lastUpdated: moment()
      };
    case FETCH_ORDERS_BY_SECRET_KEY:
      return { ...state, order: action.payload };
    case FETCH_PREVIOUS:
      return { ...state };
    case FETCH_NEXT:
      return { ...state };
    case FETCH_ORDERS_BY_FILTER:
      return {
        ...state,
        orders: action.payload.results,
        totalOrders: action.payload.count,
        totalPages: Math.ceil(action.payload.count/action.pageSize),
        lastUpdated: moment(),
        queryId: action.queryId
      };
    case FETCH_ORDER_DETAILS:
      return {
        ...state,
        orderDetails: action.payload,
      };
    case DELETE_ORDER:
      return { ...state, error: false, message: "Order(s) successfully deleted." };
    case ORDERS_ACTION_ERROR:
      return { ...state, error: true, message: "An error has occured, please try again." }
    case CLEAR_ORDER_ERRORS:
      return { ...state, error: null, errorData: null, message: null, status: null };
    default:
      return state;
  }
}
