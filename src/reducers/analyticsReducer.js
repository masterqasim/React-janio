import {
  LOAD_METABASE_URL_DONE,
  LOAD_METABASE_URL_ERROR
} from "../actions/types";

export default function (state = {}, action) {
  switch (action.type) {
    case LOAD_METABASE_URL_DONE:
      return { ...state, data: action.payload, loading: false, error: false };
    case LOAD_METABASE_URL_ERROR:
      return { ...state, loading: false, error: true };
    default:
      return state;
  }
}
