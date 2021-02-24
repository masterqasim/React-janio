import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_ORDERS_IN_CSV,
  FETCH_TRACKER_UPDATES_IN_CSV,
  CLEAR_REPORT_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchOrdersInCSV(secretKey, serviceId, pickupCountry,
  consigneeCountry, uploadBatchNo, statusCode,
  dateFrom, dateTo, trackingNo,
  emails) {
  console.log('fetching orders in csv by [secretKey=%s serviceId=%s pickupCountry=%s consigneeCountry=%s uploadBatchNo=%s statusCode=%s dateFrom=%s dateTo=%s trackingNo=%s emails=%s]...',
    secretKey, serviceId, pickupCountry,
    consigneeCountry, uploadBatchNo, statusCode,
    dateFrom, dateTo, trackingNo,
    emails);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/fetch-orders-in-csv/`,
      {
        secret_key: secretKey,
        service_id: serviceId,
        pickup_country: pickupCountry,
        consignee_country: consigneeCountry,
        upload_batch_no: uploadBatchNo,
        status_code: statusCode,
        date_from: dateFrom,
        date_to: dateTo,
        tracking_nos: trackingNo,
        emails: emails
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_ORDERS_IN_CSV,
          payload: response.data,
          emailsMessage: response.data.message
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function fetchTrackerUpdatesInCSV(secretKey, serviceId, pickupCountry,
  consigneeCountry, uploadBatchNo, statusCode,
  dateFrom, dateTo, trackingNo,
  emails) {
  console.log('fetching tracker updates in csv by [secretKey=%s serviceId=%s pickupCountry=%s consigneeCountry=%s uploadBatchNo=%s statusCode=%s dateFrom=%s dateTo=%s trackingNo=%s emails=%s]...',
    secretKey, serviceId, pickupCountry,
    consigneeCountry, uploadBatchNo, statusCode,
    dateFrom, dateTo, trackingNo,
    emails);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/fetch-tracker-updates-in-csv/`,
      {
        secret_key: secretKey,
        service_id: serviceId,
        pickup_country: pickupCountry,
        consignee_country: consigneeCountry,
        upload_batch_no: uploadBatchNo,
        status_code: statusCode,
        date_from: dateFrom,
        date_to: dateTo,
        tracking_nos: trackingNo,
        emails: emails
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: FETCH_TRACKER_UPDATES_IN_CSV,
          payload: response.data,
          emailsMessage: response.data.message
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  }
}

export function clearReportErrors() {
  console.log('clearing report errors...');
  return {
    type: CLEAR_REPORT_ERRORS
  }
}
