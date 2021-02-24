import {
  FETCH_SHOPIFY_SHOPS,
  FETCH_SHOPIFY_ORDERS,
  CLEAR_SUBMIT_SHOPIFY_ORDERS_ERRORS
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_SHOPIFY_SHOPS:
      return { ...state, shopifyShops: action.payload };
    case FETCH_SHOPIFY_ORDERS:
      return { ...state, shopifyOrders: action.payload };
    case CLEAR_SUBMIT_SHOPIFY_ORDERS_ERRORS:
      return { ...state, error: null, errorData: null, message: null };
    default:
      return state;
  }
}
