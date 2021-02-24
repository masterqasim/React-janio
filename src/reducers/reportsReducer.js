import {
  FETCH_ORDERS_IN_CSV,
  FETCH_TRACKER_UPDATES_IN_CSV,
  CLEAR_REPORT_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_ORDERS_IN_CSV:
      return {
        ...state,
        ordersInCSV: action.payload,
        emailsMessage: action.emailsMessage,
        lastUpdatedFetchOrdersDetails: moment()
      };
    case FETCH_TRACKER_UPDATES_IN_CSV:
      return {
        ...state,
        trackerUpdatesInCSV: action.payload,
        emailsMessage: action.emailsMessage,
        lastUpdatedFetchTrackerUpdates: moment()
      };
    case CLEAR_REPORT_ERRORS:
      return { ...state, error: null, message: null, ordersInCSV: [], trackerUpdatesInCSV: [], emailsMessage: null };
    default:
      return state;
  }
}
