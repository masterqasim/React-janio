import axios from 'axios';
import {
  SUBMIT_REGISTER,
  REGISTER_ACCOUNT,
  CLEAR_REGISTER_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// const defaultToken = localStorage.getItem('token');
// if (defaultToken) {
//   axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
// }

export function submitRegister(email, password, name,
  contactNumber, agentApplicationName) {
  console.log('submiting register...');
  return function(dispatch) {
    axios.post(
      `${ROOT_URL}/admin/register-shipper/`,
      {
        "email": email,
        "password": password,
        "name": name,
        "number": contactNumber,
        "agent_application_name": agentApplicationName,
        "added_by_admin": true
      }
    )
      .then((response) => {
        console.log(response);
        dispatch({
          type: SUBMIT_REGISTER,
          payload: false
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({
          type: SUBMIT_REGISTER,
          errorData: error.data.non_field_errors
        });
      });
  }
}

export function registerAccount(email, password, shop) {
  console.log('registering account...');
  return function(dispatch) {
    axios.post(
      `${ROOT_URL}/admin/register-account/`,
      {
        "email": email,
        "password": password,
        "shop": shop
      }
    )
      .then((response) => {
        console.log(response);
        const agentApplicationSecretKey = response.data.secret_key;
        localStorage.setItem('agentApplicationSecretKey', agentApplicationSecretKey);
        localStorage.setItem('shopifyShop', shop);
        dispatch({
          type: REGISTER_ACCOUNT,
          payload: false,
          permissionUrl: response.data.permission_url
        });
      })
      .catch((error) => {
        console.log(error);
        dispatch({
          type: REGISTER_ACCOUNT,
          errorData: error.data
        });
      });
  }
}

export function clearRegisterErrors() {
  console.log('clearing register errors...');
  return {
    type: CLEAR_REGISTER_ERRORS
  }
}
