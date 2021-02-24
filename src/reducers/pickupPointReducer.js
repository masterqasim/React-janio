import {
  FETCH_PICKUP_POINT,
  FETCH_PICKUP_POINT_BY_ID,
  ADD_PICKUP_POINT,
  EDIT_PICKUP_POINT,
  DELETE_PICKUP_POINT,
  CLEAR_PICKUP_POINT_ERRORS
} from '../actions/types';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_PICKUP_POINT:
      return { ...state, pickupPoints: action.payload };
    case FETCH_PICKUP_POINT_BY_ID:
      return { ...state, pickupPoint: action.payload };
    case ADD_PICKUP_POINT:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData
      };
    case EDIT_PICKUP_POINT:
      return {
        ...state,
        error: action.payload,
        errorData: action.errorData,
        message: 'Update pickup point success!'
      };
    case DELETE_PICKUP_POINT:
      return {
        ...state,
        error: action.payload,
        message: 'Delete pickup point success!',
        status: action.status
      };
    case CLEAR_PICKUP_POINT_ERRORS:
      return { ...state, error: null, errorData: null, message: null, status: null };
    default:
      return state;
  }
}
