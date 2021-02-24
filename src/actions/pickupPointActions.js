import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_PICKUP_POINT,
  FETCH_PICKUP_POINT_BY_ID,
  ADD_PICKUP_POINT,
  EDIT_PICKUP_POINT,
  DELETE_PICKUP_POINT,
  CLEAR_PICKUP_POINT_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchPickupPoint() {
  console.log('fetching pickup point...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shipper/pickup-point/`,
      { headers: { 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_PICKUP_POINT,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    })
  }
}

export function fetchPickupPointById(id) {
  console.log('fetching pickup point by id ' + id + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/shipper/pickup-point/${id}/`,
      { headers: { 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_PICKUP_POINT_BY_ID,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    })
  }
}

export function addPickupPoint(data) {
  console.log('adding pickup point...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/shipper/pickup-point/`,
      data,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: ADD_PICKUP_POINT,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: ADD_PICKUP_POINT,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function editPickupPoint(pickupPointId, data) {
  console.log('editing pickup point by ' + pickupPointId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.put(`${ROOT_URL}/shipper/pickup-point/${pickupPointId}/`,
      data,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: EDIT_PICKUP_POINT,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: EDIT_PICKUP_POINT,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function deletePickupPoint(pickupPointId) {
  console.log('deleting pickup point by ' + pickupPointId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.delete(`${ROOT_URL}/shipper/pickup-point/${pickupPointId}/`,
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: DELETE_PICKUP_POINT,
        payload: false,
        status: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: DELETE_PICKUP_POINT,
        payload: true
      });
    });
  }
}

export function clearPickupPointErrors() {
  console.log('clearing pickup point errors...');
  return {
    type: CLEAR_PICKUP_POINT_ERRORS
  }
}
