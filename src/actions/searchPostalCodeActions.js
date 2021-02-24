import axios from 'axios';
import {
  FETCH_POSTAL_SEARCH,
  CLEAR_SEARCH_POSTAL_CODE_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchPostalSearch(secretKey, postalCode, country) {
  console.log('fetching postal search...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/data/postal-search/`,
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
        type: FETCH_POSTAL_SEARCH,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_POSTAL_SEARCH,
        errorData: error.data
      });
    });
  }
}

export function clearSearchPostalCodeErrors() {
  console.log('clearing search postal code errors...');
  return {
    type: CLEAR_SEARCH_POSTAL_CODE_ERRORS
  }
}
