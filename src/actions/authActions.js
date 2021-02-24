import axios from "axios";
import {
  AUTH_USER,
  AUTH_ERROR,
  UNAUTH_USER,
  FETCH_SIGNED_IN_USER,
  EDIT_SIGNED_IN_USER,
  CHANGE_PASSWORD,
  RESET_PASSWORD,
  PASSWORD_SENT,
  CLEAR_AUTH_ERRORS,
  DESTROY_FRESHWIDGET
} from "./types";
import { ROOT_URL } from "./index";
import {
  fetchShipperDetailsRequest,
  fetchShipperDetails
} from "./shipperDetailsActions";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

const defaultToken = localStorage.getItem("token");
if (defaultToken) {
  axios.defaults.headers.common["Authorization"] = "Token " + defaultToken;
}

export const signinUserRequest = async data => {
  const { username, password, shop } = data;
  const response = await axios.post(`${ROOT_URL}/auth/login/`, {
    username,
    password,
    shop
  });
  return response.data;
};

export const signinUser = (username, password, history, shopifyParams = "") => {
  console.log("signing in...");
  return function(dispatch) {
    axios
      .post(`${ROOT_URL}/auth/login/`, { username, password, shopifyParams })
      .then(loginResponse => {
        const { token, user_id } = loginResponse.data;
        localStorage.setItem("token", token);
        localStorage.setItem("_id", user_id);

        axios.defaults.headers.common["Authorization"] = `Token ${token}`;
        fetchShipperDetailsRequest()
          .then(shipperDetailsResponse => {
            dispatch(fetchShipperDetails(shipperDetailsResponse.data));
            dispatch({
              type: AUTH_USER
            });
            if (loginResponse.data.shopify_is_valid) {
              history.push({
                pathname: "/shopify-order",
                search: shopifyParams
              });
            } else {
              history.push("/");
            }
          })
          .catch(error => {
            dispatch({
              type: AUTH_ERROR
            });
          });
      })
      .catch(error => {
        dispatch({
          type: AUTH_ERROR
        });
      });
  };
};

export function signoutUser(history) {
  console.log("signing out...");
  localStorage.clear();

  return function(dispatch) {
    dispatch({ type: UNAUTH_USER });
    dispatch({ type: DESTROY_FRESHWIDGET });
    history.push("/signin");
  };
}

export function fetchSignedInUser() {
  console.log("fetching currently signin user...");
  const token = localStorage.getItem("token");

  return function(dispatch) {
    axios
      .get(`${ROOT_URL}/auth/profile/`, {
        headers: { Authorization: "Token " + token }
      })
      .then(response => {
        dispatch({
          type: FETCH_SIGNED_IN_USER,
          payload: response.data[0]
        });
      })
      .catch(error => {
        console.log(error);
        dispatch({ type: UNAUTH_USER });
      });
  };
}

export function editSignedInUser(id, emailValue, nameValue) {
  console.log("editing currently signin user...");
  const token = localStorage.getItem("token");

  return function(dispatch) {
    axios
      .patch(
        `${ROOT_URL}/auth/profile/${id}/`,
        {
          email: emailValue,
          name: nameValue
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + token
          }
        }
      )
      .then(response => {
        dispatch({
          type: EDIT_SIGNED_IN_USER,
          payload: false,
          editType: "user"
        });
        dispatch(fetchSignedInUser());
      })
      .catch(error => {
        dispatch({
          type: EDIT_SIGNED_IN_USER,
          payload: true,
          editType: "user",
          errorData: error.data
        });
      });
  };
}

export function changePassword(id, currentPasswordValue, newPasswordValue) {
  console.log("changing password...");
  const token = localStorage.getItem("token");

  return function(dispatch) {
    axios
      .patch(
        `${ROOT_URL}/auth/profile/${id}/`,
        {
          current_password: currentPasswordValue,
          password: newPasswordValue
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + token
          }
        }
      )
      .then(response => {
        dispatch({
          type: CHANGE_PASSWORD,
          payload: false,
          editType: "changePassword"
        });
      })
      .catch(error => {
        dispatch({
          type: CHANGE_PASSWORD,
          payload: true,
          editType: "changePassword",
          errorData: error.data
        });
      });
  };
}

export function resetPassword(emailAddress) {
  console.log("resetting password...");

  return function(dispatch) {
    axios
      .post(
        `${ROOT_URL}/auth/reset-password/request/`,
        {
          email: emailAddress,
          portal: "merchant"
        },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(response => {
        dispatch({
          type: RESET_PASSWORD,
          payload: false
        });
      })
      .catch(error => {
        dispatch({
          type: RESET_PASSWORD,
          payload: true
        });
      });
  };
}

export function passwordSent(newPassword, resetToken) {
  console.log("password sent...");

  return function(dispatch) {
    axios
      .post(
        `${ROOT_URL}/auth/reset-password/`,
        {
          resetToken: resetToken,
          newPassword: newPassword,
          portal: "merchant"
        },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(response => {
        dispatch({
          type: PASSWORD_SENT,
          payload: false
        });
      })
      .catch(error => {
        dispatch({
          type: PASSWORD_SENT,
          payload: true
        });
      });
  };
}

export function clearAuthErrors() {
  console.log("clearing auth errors...");
  return {
    type: CLEAR_AUTH_ERRORS
  };
}
