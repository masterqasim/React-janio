import axios from 'axios';
import {
  LOAD_METABASE_URL_DONE,
  LOAD_METABASE_URL_ERROR
} from "./types";
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function loadMetabaseEmbedUrl(secretKey) {
  console.log('loading metabase embed url...');

  return function (dispatch) {
    axios.post(`${ROOT_URL}/analytic/metabase-url/`,
      {
        'secret_key': secretKey
      }
    )
    .then((response) => {
      console.log(response)
      dispatch({
        type: LOAD_METABASE_URL_DONE,
        payload: response.data
      });
    })
    .catch((error) => {
      dispatch({
        type: LOAD_METABASE_URL_ERROR,
        payload: error.data,
        error: true
      });
    });
  }
}
