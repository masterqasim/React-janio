import axios from 'axios';
import {
  UNAUTH_USER,
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
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchService(secretKey) {
  console.log('fetching service...');
  const token = localStorage.getItem('token');

  return function(dispatch, getState) {
    const state = getState()
    if (!state.order.service) {
      axios.get(`${ROOT_URL}/order/service/`,
        {
          params: {
            secret_key: secretKey,
            new: true
          }
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          console.log(response);
          dispatch({
            type: FETCH_SERVICE,
            payload: response.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
    } else {
      dispatch({
        type: FETCH_SERVICE,
        payload: [...state.order.service]
      });
    }
  }
}

export function sendVerfication(objId) {
  const token = localStorage.getItem('token');
  return function(dispatch, getState) {
    axios.post(`${ROOT_URL}/shipper/agree-tnc`,
        objId,
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
  }

}

export function fetchAllCountries() {
  console.log('fetching all countries...');
  const token = localStorage.getItem('token');

  return function(dispatch, getState) {
    const state = getState()
    if (!state.order.countries) {
      axios.get(`${ROOT_URL}/data/places/`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          dispatch({
            type: FETCH_ALL_COUNTRIES,
            payload: response.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
    } else {
      dispatch({
        type: FETCH_ALL_COUNTRIES,
        payload: [...state.order.countries]
      });
    }
  }
}

export function fetchItemCategory() {
  console.log('fetching item category...');
  const token = localStorage.getItem('token');

  return function(dispatch, getState) {
    const state = getState()
    if (!state.order.itemCategory) {
      axios.get(`${ROOT_URL}/data/item-categories/`,
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          dispatch({
            type: FETCH_ITEM_CATEGORY,
            payload: response.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
    } else {
      dispatch({
        type: FETCH_ITEM_CATEGORY,
        payload: [...state.order.itemCategory]
      });
    }
  }
}

export function fetchItemPriceCurrency() {
  console.log('fetching item price currency...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/data/currencies/`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        dispatch({
          type: FETCH_ITEM_PRICE_CURRENCY,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function fetchConvertedValue(toConvertList) {
  console.log('fetching converted value...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/data/currency-conversion/`,
      {
        "to_convert": toConvertList
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_CONVERTED_VALUE,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function addOrder(secretKey, serviceId,
  consigneeName, consigneeAddress, consigneePostal,
  consigneeCountry, consigneeCity, consigneeState,
  consigneeProvince, consigneeNumber, shipperOrderId,
  consigneeEmail, orderLength, orderWidth,
  orderHeight, orderWeight, pickupCountry,
  pickupAddress, paymentType, itemsList) {
  console.log('adding order...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/order/`,
      {
        "secret_key": secretKey,
        "service_id": serviceId,
        "consignee_name": consigneeName,
        "consignee_address": consigneeAddress,
        "consignee_postal": consigneePostal,
        "consignee_country": consigneeCountry,
        "consignee_city": consigneeCity,
        "consignee_state": consigneeState,
        "consignee_province": consigneeProvince,
        "consignee_number": consigneeNumber,
        "shipper_order_id": shipperOrderId,
        "consignee_email": consigneeEmail,
        "order_length": orderLength,
        "order_width": orderWidth,
        "order_height": orderHeight,
        "order_weight": orderWeight,
        "pickup_country": pickupCountry,
        "pickup_address": pickupAddress,
        "payment_type": paymentType,
        "items": itemsList
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: ADD_ORDER,
          payload: false
        })
      })
      .catch((error) => {
        console.log(error);
        dispatch({
          type: ADD_ORDER,
          payload: true,
          errorData: error.data
        })
      });
  }
}

export function editOrder(orderId, secretKey, serviceId,
  consigneeName, consigneeAddress, consigneePostal,
  consigneeCountry, consigneeCity, consigneeState,
  consigneeProvince, consigneeNumber, shipperOrderId,
  consigneeEmail, orderLength, orderWidth,
  orderHeight, orderWeight, pickupCountry,
  pickupAddress, pickupPostal, paymentType, itemsList) {
  console.log('editing order by orderId ' + orderId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.put(`${ROOT_URL}/order/order/${orderId}/`,
      {
        "secret_key": secretKey,
        "service_id": serviceId,
        "consignee_name": consigneeName,
        "consignee_address": consigneeAddress,
        "consignee_postal": consigneePostal,
        "consignee_country": consigneeCountry,
        "consignee_city": consigneeCity,
        "consignee_state": consigneeState,
        "consignee_province": consigneeProvince,
        "consignee_number": consigneeNumber,
        "shipper_order_id": shipperOrderId,
        "consignee_email": consigneeEmail,
        "order_length": orderLength,
        "order_width": orderWidth,
        "order_height": orderHeight,
        "order_weight": orderWeight,
        "pickup_address": pickupAddress,
        "pickup_postal": pickupPostal,
        "pickup_country": pickupCountry,
        "payment_type": paymentType,
        "items": itemsList
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: EDIT_ORDER,
          payload: false
        })
      })
      .catch((error) => {
        dispatch({
          type: EDIT_ORDER,
          payload: true
        })
      });
  }
}

export function addOrders(secretKey, ordersList) {
  console.log('adding orders...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/orders/`,
      {
        "secret_key": secretKey,
        "orders": ordersList
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: ADD_ORDERS,
          payload: false,
          status: response.status
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({
          type: ADD_ORDERS,
          payload: true,
          status: error.status,
          errorData: error.data
        });
      });
  }
}

export function fetchOrderBySecretKey(secretKey, pageNumber) {
  console.log('fetching order by secret key ' + secretKey + ' and page ' + pageNumber + '...');
  const token = localStorage.getItem('token');

  if (pageNumber === null) {
    return function(dispatch) {
      axios.get(`${ROOT_URL}/order/order/`,
        {
          params: {
            secret_key: secretKey
          }
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          dispatch({
            type: FETCH_ORDERS_BY_SECRET_KEY,
            payload: response.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
    }
  } else {
    return function(dispatch) {
      axios.get(`${ROOT_URL}/order/order/`,
        {
          params: {
            secret_key: secretKey,
            page: pageNumber + 1
          }
        },
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
      )
        .then((response) => {
          dispatch({
            type: FETCH_ORDERS_BY_SECRET_KEY,
            payload: response.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
    }
  }
}

export function fetchPrevious(previousUrl) {
  console.log('fetching previous order...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${previousUrl}`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
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
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
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

export function fetchOrderByFilter(secretKey, serviceId, trackingNo,
  shipperOrderId, statusCode, uploadBatchNo,
  pickupCountry, consigneeCountry, dateFrom,
  dateTo, isProcessing, pageNumber, pageSize, queryId, consigneeName, phoneNumber, pickupDateFrom, pickupDateTo, pickupDate) {
  console.log('fetching order by [secretKey=%s serviceId=%d trackingNo=%s shipperOrderId=%s statusCode=%s uploadBatchNo=%s pickupCountry=%s consigneeCountry=%s dateFrom=%s dateTo=%s page=%s, pickupDateFrom=%s, pickupDateTo=%s, pickupDate=%s]...',
    secretKey, serviceId, trackingNo,
    shipperOrderId, statusCode, uploadBatchNo,
    pickupCountry, consigneeCountry, dateFrom,
    dateTo, isProcessing, pageNumber, pickupDateFrom, pickupDateTo, pickupDate);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    if (!isProcessing) {
      isProcessing = null
    }
    axios.get(`${ROOT_URL}/order/order/`,
      {
        params: {
          secret_key: secretKey,
          service_id: serviceId,
          tracking_no: trackingNo,
          shipper_order_id: shipperOrderId,
          status_code: statusCode,
          upload_batch_no: uploadBatchNo,
          pickup_country: pickupCountry,
          consignee_country: consigneeCountry,
          consignee_name: consigneeName,
          consignee_number: phoneNumber,
          date_from: dateFrom,
          date_to: dateTo,
          pickup_date_from: pickupDateFrom,
          pickup_date_to: pickupDateTo,
          pickup_date: pickupDate,
          is_processing: isProcessing,
          page: pageNumber,
          page_size: pageSize,
          with_items: true
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_ORDERS_BY_FILTER,
          payload: response.data,
          pageSize: pageSize || 50,
          queryId
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function fetchOrderDetails(secretKey, orderId) {
  console.log('fetching order details by orderId ' + orderId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/order/order/${orderId}`,
      {
        params: {
          secret_key: secretKey,
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_ORDER_DETAILS,
          payload: response.data[0]
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function deleteOrder(orderId, secretKey) {
  console.log('deleting order by orderId ' + orderId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.delete(`${ROOT_URL}/order/order/${orderId}`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: DELETE_ORDER,
          payload: false
        });
      })
      .catch((response) => {
        dispatch({
          type: ORDERS_ACTION_ERROR,
          payload: true
        });
      });
  }
}

export function fetchStatuses() {
  console.log('fetching statuses...');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/data/tracker-statuses/`
    )
      .then((response) => {
        dispatch({
          type: FETCH_STATUSES,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function fetchUploadBatchNo(secretKey) {
  console.log('fetching upload batch no...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/order/upload-batch-no/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then(response => {
        dispatch({
          type: FETCH_UPLOAD_BATCH_NO,
          payload: response.data
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function clearOrderErrors() {
  console.log('clearing order errors...');
  return {
    type: CLEAR_ORDER_ERRORS
  }
}

const distance = (lat1, lon1, lat2, lon2) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    return dist * 1.609344;
  }
}

export function fetchParkers() {
  console.log('fetching parkers...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/partner/pnp-parkers/`, {
      headers: { 'Content-Type': 'application/json',
                 'Authorization': 'Token ' + token }
    })
      .then(response => {
        console.log(response.data)
        
        if (navigator.geolocation) {
          let long, lat = null
          navigator.geolocation.getCurrentPosition((position)=>{
            long = position.coords.longitude
            lat = position.coords.latitude
            response.data.sort((a,b) => (distance(lat, long, a.lat, a.long) - distance(lat, long, b.lat, b.long)))
            dispatch({
              type: FETCH_PARKERS,
              payload: response.data
            });
          },(error) =>{
            console.log('Rejected',error)
            dispatch({
              type: FETCH_PARKERS,
              payload: response.data
            });
          });
          
        } else {
          console.log('Geolocation is not supported by this browser.')
        }
        
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}
