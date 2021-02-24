import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_INVOICES_WITH_FITLER,
  FETCH_INVOICES_WITH_FITLER_ERRORS,
  FETCH_INVOICES_PDF,
  FETCH_STATUSES,
  CLEAR_INVOICE_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchInvoicesWithFilter(secretKey, invoiceNo, statusCode, page) {
  console.log('fetching invoices by filter [secretKey=%s invoiceNo=%s statusCode=%s page=%s]...',
              secretKey, invoiceNo, statusCode, page);
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/payment/invoice/`,
      {
        params: {
          secret_key: secretKey,
          invoice_no: invoiceNo,
          status: statusCode,
          page: page
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {

      dispatch({
        type: FETCH_INVOICES_WITH_FITLER,
        payload: response.data.results
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_INVOICES_WITH_FITLER_ERRORS,
        errorData: error.response.data
      });
    });
  }
}

export function fetchInvoicesPdf(secretKey, invoiceId) {
  console.log('fetching invoices pdf...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/payment/invoice/`,
      {
        params: {
          secret_key: secretKey,
          pdf: true,
          invoice_id: invoiceId
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response)
      dispatch({
        type: FETCH_INVOICES_PDF,
        payload: response.data,
        invoicesPdfStatus: response.status
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });
  }
}

export function fetchStatuses() {
  console.log('fetching statuses...');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/data/invoice-statuses/`
    )
    .then((response) => {
      console.log(response);
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

export function clearInvoiceErrors() {
  console.log('clearing invoice errors...');
  return {
    type: CLEAR_INVOICE_ERRORS
  }
}
