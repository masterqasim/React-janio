import axios from 'axios';
import {
  FETCH_ITEM_DETAILS_WITH_FITLER,
  FETCH_ITEM_DETAILS_BY_ID,
  ADD_ITEM_DETAILS,
  UPDATE_ITEM_DETAILS_BY_ID,
  DELETE_ITEM_DETAILS_BY_ID,
  GET_ITEM_DETAILS_CSV,
  CLEAR_ITEM_DETAILS_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchItemDetailsWithFilter(secretKey, shipperProfile, itemDesc,
                                            itemCategory, itemProductId, itemSku,
                                            itemPriceValue, itemPriceCurrency, page) {
  console.log('fetching item details by filter [secretKey=%s shipperProfile=%s itemDesc=%s itemCategory=%s itemProductId=%s itemSku=%s itemPriceValue=%s itemPriceCurrency=%s page=%s]...',
              secretKey, shipperProfile, itemDesc, itemCategory, itemProductId, itemSku, itemPriceValue, itemPriceCurrency, page);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shipper/item-details/`,
      {
        params: {
          secret_key: secretKey,
          shipper_profile: shipperProfile,
          item_desc: itemDesc,
          item_category: itemCategory,
          item_product_id: itemProductId,
          item_sku: itemSku,
          item_price_value: itemPriceValue,
          item_price_currency: itemPriceCurrency,
          page: page
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_ITEM_DETAILS_WITH_FITLER,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_ITEM_DETAILS_WITH_FITLER,
        errorData: error.data
      });
    });
  }
}

export function fetchItemDetailsById(secretKey, itemDetailsId) {
  console.log('fetching item details by id ' + itemDetailsId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shipper/item-details/${itemDetailsId}/`,
      {
        params: {
          "secret_key": secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_ITEM_DETAILS_BY_ID,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_ITEM_DETAILS_BY_ID,
        errorData: error.data
      });
    });
  }
}

export function addItemDetails(data) {
  console.log('adding item details...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/shipper/item-details/`,
      data,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: ADD_ITEM_DETAILS,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: ADD_ITEM_DETAILS,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function updateItemDetailsById(itemDetailsId, data) {
  console.log('updating item details by id ' + itemDetailsId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.patch(`${ROOT_URL}/shipper/item-details/${itemDetailsId}/`,
      data,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: UPDATE_ITEM_DETAILS_BY_ID,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: UPDATE_ITEM_DETAILS_BY_ID,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function deleteItemDetailsById(secretKey, itemDetailsId) {
  console.log('deleting item details by id ' + itemDetailsId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.delete(`${ROOT_URL}/shipper/item-details/${itemDetailsId}/`,
      {
        params: {
          "secret_key": secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: DELETE_ITEM_DETAILS_BY_ID,
        payload: false,
        status: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: DELETE_ITEM_DETAILS_BY_ID,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function getItemDetailsCSV(secretKey, shipperProfile, itemDesc,
                                  itemCategory, itemProductId, itemSku,
                                  itemPriceValue, itemPriceCurrency) {
  console.log('getting item details csv [secretKey=%s shipperProfile=%s itemDesc=%s itemCategory=%s itemProductId=%s itemSku=%s itemPriceValue=%s itemPriceCurrency=%s]...',
              secretKey, shipperProfile, itemDesc, itemCategory, itemProductId, itemSku, itemPriceValue, itemPriceCurrency);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shipper/item-details/csv/`,
      {
        params: {
          "secret_key": secretKey,
          "shipper_profile": shipperProfile,
          "item_desc": itemDesc,
          "item_category": itemCategory,
          "item_product_id": itemProductId,
          "item_sku": itemSku,
          "item_price_value": itemPriceValue,
          "item_price_currency": itemPriceCurrency
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: GET_ITEM_DETAILS_CSV,
        itemDetailsCSV: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: GET_ITEM_DETAILS_CSV,
        errorData: error.data
      });
    });
  }
}

export function clearItemDetailsErrors() {
  console.log('clearing item details errors...');
  return {
    type: CLEAR_ITEM_DETAILS_ERRORS
  }
}
