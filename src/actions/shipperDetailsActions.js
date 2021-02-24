import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_LANGUAGES,
  FETCH_SHIPPER_DETAILS,
  EDIT_SHIPPER_DETAILS,
  CLEAR_SHIPPER_DETAILS_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchLanguages() {
  console.log('fetching languages...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/data/languages/`,
      { headers: { 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_LANGUAGES,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });
  }
}

export const fetchShipperDetailsRequest = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('_id')
  return axios.get(`${ROOT_URL}/shipper/shipper/${userId}/`,
    { headers: { 'Authorization': 'Token ' + token }}
  )
}

export function fetchShipperDetails(data=null) {
  console.log('fetching shipper details...');

  return function(dispatch, getState) {
    const state = getState()
    if (data) {
      dispatch({
        type: FETCH_SHIPPER_DETAILS,
        payload: data
      })
    } else {
      if (!state.shipperDetails.hasOwnProperty('shipperDetails')) {
        fetchShipperDetailsRequest().then(shipperDetailsResponse => {
          dispatch({
            type: FETCH_SHIPPER_DETAILS,
            payload: shipperDetailsResponse.data
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch({ type: UNAUTH_USER });
        });
      } else {
        dispatch({
          type: FETCH_SHIPPER_DETAILS,
          payload: {...state.shipperDetails.shipperDetails}
        });
      }
    }
  }
}

export function editShipperDetails(userId, shipperName, shipperEmail,
                                    shipperNumber, enableSMS, enableEmail,
                                    language) {
  console.log('editing shipper details...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.patch(`${ROOT_URL}/shipper/shipper/${userId}/`,
      {
        "user_id": userId,
        "shipper_name": shipperName,
        "shipper_email": shipperEmail,
        "shipper_number": shipperNumber,
        "enable_sms": enableSMS,
        "enable_email": enableEmail,
        "language": language
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response)
      dispatch({
        type: EDIT_SHIPPER_DETAILS,
        payload: false
      });
    })
    .catch((error) => {
      dispatch({
        type: EDIT_SHIPPER_DETAILS,
        payload: true
      });
    });
  }
}

export function clearShipperDetailsErrors() {
  console.log('clearing shipper details errors...');
  return {
    type: CLEAR_SHIPPER_DETAILS_ERRORS
  }
}
