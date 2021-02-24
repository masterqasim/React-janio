import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_SHOPIFY_SHOPS,
  FETCH_SHOPIFY_ORDERS,
  CLEAR_SUBMIT_SHOPIFY_ORDERS_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchShopifyShops(secretKey) {
  console.log('fetching shopify shops...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shopify/get-shopify-shops/`,
      {
        params: {
          'secret_key': secretKey
        }
      },
      { headers: { 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_SHOPIFY_SHOPS,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });;
  }
}

export function fetchShopifyOrders(shop) {
  console.log('fetching shopify orders...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shopify/get-orders/`,
      {
        params: {
          'shop': shop
        }
      },
      { headers: { 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_SHOPIFY_ORDERS,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });;
  }
}

export function clearSubmitShopifyOrdersErrors() {
  console.log('clearing submit shopify orders errors...');
  return {
    type: CLEAR_SUBMIT_SHOPIFY_ORDERS_ERRORS
  }
}

// Post shopify url
export function postShopifyUrl(domain, secretKey) {
  console.log('submit shopify domain URL');
  const token = localStorage.getItem('token');
  return axios.post(`${ROOT_URL}/shopify/app/connect/`,
    {
      'secret_key': secretKey,
      'shop': domain,
      'added_from_portal': true
    },
    { headers: { 'Authorization': 'Token ' + token } }
  ).then(res => {
    return res
  })
}