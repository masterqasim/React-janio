import axios from 'axios';
import {
  FETCH_SUB_PROFILES,
  FETCH_SUB_PROFILE_BY_ID,
  ADD_SUB_PROFILE,
  EDIT_SUB_PROFILE,
  DELETE_SUB_PROFILE,
  CLEAR_SUB_PROFILES_ERRORS
} from './types';
import { ROOT_URL } from './index';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const defaultToken = localStorage.getItem('token');
if (defaultToken) {
  axios.defaults.headers.common['Authorization'] = 'Token ' + defaultToken;
}

export function fetchSubProfiles(secretKey) {
  console.log('fetching sub profiles...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/order/sub-app/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_SUB_PROFILES,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_SUB_PROFILES,
        errorData: error.data
      });
    });
  }
}

export function fetchSubProfilesById(agentApplicationId, secretKey) {
  console.log('fetching sub profile by id ' + agentApplicationId + '...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.get(`${ROOT_URL}/order/sub-app/${agentApplicationId}/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: FETCH_SUB_PROFILE_BY_ID,
        payload: response.data
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: FETCH_SUB_PROFILE_BY_ID,
        errorData: error.data
      });
    });
  }
}

export function addSubProfile(secretKey, agentApplicationName, agentApplicationContactPerson,
                              agentApplicationNumber, agentApplicationEmail, password,
                              privilege) {
  console.log('adding sub profile...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.post(`${ROOT_URL}/order/sub-app/`,
      {
        secret_key: secretKey,
        agent_application_name: agentApplicationName,
        agent_application_contact_person: agentApplicationContactPerson,
        agent_application_number: agentApplicationNumber,
        agent_application_email: agentApplicationEmail,
        password: password,
        privilege: privilege
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: ADD_SUB_PROFILE,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: ADD_SUB_PROFILE,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function editSubProfile(agentApplicationId, secretKey, agentApplicationName, agentApplicationContactPerson,
                              agentApplicationNumber, agentApplicationEmail, password,
                              privilege) {
  console.log('editing sub profile...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.put(`${ROOT_URL}/order/sub-app/${agentApplicationId}/`,
      {
        secret_key: secretKey,
        agent_application_name: agentApplicationName,
        agent_application_contact_person: agentApplicationContactPerson,
        agent_application_number: agentApplicationNumber,
        agent_application_email: agentApplicationEmail,
        password: password,
        privilege: privilege
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: EDIT_SUB_PROFILE,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: EDIT_SUB_PROFILE,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function deleteSubProfile(agentApplicationId, secretKey) {
  console.log('deleting sub profile...');
  const token = localStorage.getItem('token');

  return function(dispatch) {
    axios.delete(`${ROOT_URL}/order/sub-app/${agentApplicationId}/`,
      {
        params: {
          secret_key: secretKey
        }
      },
      { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }}
    )
    .then((response) => {
      console.log(response);
      dispatch({
        type: DELETE_SUB_PROFILE,
        payload: false
      });
    })
    .catch((error) => {
      console.log(error);
      dispatch({
        type: DELETE_SUB_PROFILE,
        payload: true,
        errorData: error.data
      });
    });
  }
}

export function clearSubProfilesErrors() {
  console.log('clearing sub profiles errors...');
  return {
    type: CLEAR_SUB_PROFILES_ERRORS
  }
}
