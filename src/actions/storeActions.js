import axios from 'axios';
import {
  UNAUTH_USER,
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
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchStore(secretKey) {
  console.log('fetching store...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/store/store/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_STORE,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_STORE,
        errorData: error.data.message
      });
    });;
  }
}

export function fetchStoreById(storeId, secretKey) {
  console.log('fetching store by id ' + storeId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/store/store/${storeId}/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_STORE_BY_ID,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_STORE_BY_ID,
        errorData: error.data.message
      });
    });;
  }
}

export function fetchStoreTypes() {
  console.log('fetching store types...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/store/store-types/`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_STORE_TYPES,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });;
  }
}

export function addStore(data) {
  console.log('adding store...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/store/store/`,
      data,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: ADD_STORE,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: ADD_STORE,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function deleteStore(storeId, secretKey) {
  console.log('deleting store...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.delete(`${ROOT_URL}/store/store/${storeId}/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: DELETE_STORE,
        payload: false,
        status: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: DELETE_STORE,
        payload: true
      });
    });
  }
}

export function activateStore(storeId, secretKey) {
  console.log('activating store...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/store/store/${storeId}/activate/`,
      {
        "secret_key": secretKey
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: ACTIVATE_STORE,
        payload: response.data,
        status: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: ACTIVATE_STORE,
        errorData: error.data
      });
    });
  }
}

export function deactivateStore(storeId, secretKey) {
  console.log('deactivating store...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/store/store/${storeId}/deactivate/`,
      {
        "secret_key": secretKey
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: DEACTIVATE_STORE,
        payload: response.data,
        status: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: DEACTIVATE_STORE,
        errorData: error.data
      });
    });
  }
}

export function fetchPrevious(previousUrl) {
  console.log('fetching previous order...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${previousUrl}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_PREVIOUS,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });
  }
}

export function fetchNext(nextUrl) {
  console.log('fetching next order...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${nextUrl}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_NEXT,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });
  };
}

export function fetchStoreOrderByFilter(secretKey, storeId, orderId, isAdded, createdFrom, modifiedFrom) {
  console.log('fetching store order by filter [secretKey=%s storeId=%s orderId=%s isAdded=%s createdFrom=%s modifiedFrom=%s]...',
              secretKey, storeId, orderId, isAdded, createdFrom, modifiedFrom);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/store/order/`,
      {
        params: {
          secret_key: secretKey,
          store_ids: storeId,
          order_ids: orderId,
          // count: 50,
          is_added: isAdded,
          created_from: createdFrom,
          modified_from: modifiedFrom,
          sort_by: 'create_at',
          sort_direction: 'desc'
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_STORE_ORDER_BY_FILTER,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_STORE_ORDER_BY_FILTER,
        errorData: error.data.message
      });
    });
  }
}

export function fetchStoreOrderDetails(orderId, secretKey, storeId) {
  console.log('fetching store order details...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/store/order/${orderId}/`,
      {
        params: {
          secret_key: secretKey,
          store_id: storeId
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_STORE_ORDER_DETAILS,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_STORE_ORDER_DETAILS,
        errorData: error.data
      });
    });
  }
}

export function fetchPostalIdentifier(secretKey, postalCode, country) {
  console.log('fetching postal identifier...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/data/postal-identifier/`,
      {
        secret_key: secretKey,
        postal_code: postalCode,
        country: country
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_POSTAL_IDENTIFIER,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_POSTAL_IDENTIFIER,
        errorData: error.data
      });
    });
  }
}

export function clearStoreErrors() {
  console.log('clearing store errors...');
  return {
    type: CLEAR_STORE_ERRORS
  }
}
