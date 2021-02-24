import OrderDefaultValueAPI from "../api/orderDefaultValueAPI"
import {
  FETCH_ORDER_DEFAULT_VALUES,
  FETCH_ORDER_DEFAULT_VALUES_SUCCESS,
  ORDER_DEFAULT_VALUES_ADD,
  ORDER_DEFAULT_VALUES_ADD_ERROR,
  ORDER_DEFAULT_VALUES_CLEAR,
  ORDER_DEFAULT_VALUES_DELETE,
  ORDER_DEFAULT_VALUES_UPDATE
} from "./types"
import { history } from "../utils/historyUtils";

export const fetchOrderDefaultValues = (secret_key) => {
  return async (dispatch, getState) => {
    const state = getState()

    if (!state.orderDefaultValue.fetched || !state.orderDefaultValue.data.length) {
      dispatch({
        type: FETCH_ORDER_DEFAULT_VALUES
      })

      const data = await OrderDefaultValueAPI.get({secret_key})
      if (!data.error) {
        dispatch({
          type: FETCH_ORDER_DEFAULT_VALUES_SUCCESS,
          payload: data
        })
      }
    } else {
      dispatch({
        type: FETCH_ORDER_DEFAULT_VALUES_SUCCESS,
        payload: [...state.orderDefaultValue.data]
      })
    }
  }
}

export const addOrderDefaultValue = data => {
  return async (dispatch) => {
    dispatch({ type: ORDER_DEFAULT_VALUES_CLEAR })
    
    const r = await OrderDefaultValueAPI.add(data)
    if (r.success) {
      dispatch({ type: ORDER_DEFAULT_VALUES_ADD, payload: r.data })
      setTimeout(() => {
        history.push('/configure-default-values')
        dispatch({ type: ORDER_DEFAULT_VALUES_CLEAR })
      }, 1000)
    } else {
      dispatch({ type: ORDER_DEFAULT_VALUES_ADD_ERROR, payload: r.data })
    }
  }
}

export const deleteOrderDefaultValue = (secretKey, id) => {
  return async (dispatch) => {
    const r = await OrderDefaultValueAPI.delete(secretKey, id)
    if (r.success) {
      dispatch({ type: ORDER_DEFAULT_VALUES_DELETE, payload: id })
    }
  }
}

export const updateOrderDefaultValue = (id, data) => {
  return async (dispatch) => {
    dispatch({ type: ORDER_DEFAULT_VALUES_CLEAR })
    
    const r = await OrderDefaultValueAPI.update(id, data)
    if (r.success) {
      dispatch({ type: ORDER_DEFAULT_VALUES_UPDATE, payload: r.data })
      setTimeout(() => {
        history.push('/configure-default-values')
        dispatch({ type: ORDER_DEFAULT_VALUES_CLEAR })
      }, 1000)
    } else {
      dispatch({ type: ORDER_DEFAULT_VALUES_ADD_ERROR, payload: r.data })
    }
  }
}