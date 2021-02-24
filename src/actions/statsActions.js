import axios from 'axios';
import {
  UNAUTH_USER,
  FETCH_STATS
} from './types';
import { ROOT_URL } from './index';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchStats(secretKey, pickUpCountry, consigneeCountry) {
  console.log('fetching stats...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/stats/`,
      {
        secret_key: secretKey,
        pickup_country: pickUpCountry,
        consignee_country: consigneeCountry
      },
      { headers: { 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      dispatch({
        type: FETCH_STATS,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({ type: UNAUTH_USER });
    });
  }
}
