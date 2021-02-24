import { combineReducers } from 'redux';
import authReducer from './authReducer';
import statsReducer from './statsReducer';
import registerReducer from './registerReducer';
import shipperDetailsReducer from './shipperDetailsReducer';
import pickupPointReducer from './pickupPointReducer';
import searchPostalCodeReducer from './searchPostalCodeReducer';
import storeReducer from './storeReducer';
import orderReducer from './orderReducer';
import submitShopifyOrdersReducer from './submitShopifyOrdersReducer';
import itemDetailsReducer from './itemDetailsReducer';
import reportsReducer from './reportsReducer';
import invoicesReducer from './invoicesReducer';
import subProfilesReducer from './subProfilesReducer';
import analyticsReducer from './analyticsReducer';
import orderDefaultValueRedcuer from './orderDefaultValueRedcuer'
import othersReducer from './othersReducer'

import { UNAUTH_USER } from '../actions/types';

const appReducer = combineReducers({
  auth: authReducer,
  stats: statsReducer,
  register: registerReducer,
  shipperDetails: shipperDetailsReducer,
  pickupPoint: pickupPointReducer,
  searchPostalCode: searchPostalCodeReducer,
  store: storeReducer,
  order: orderReducer,
  submitShopifyOrders: submitShopifyOrdersReducer,
  itemDetails: itemDetailsReducer,
  reports: reportsReducer,
  invoices: invoicesReducer,
  subProfiles: subProfilesReducer,
  analytics: analyticsReducer,
  orderDefaultValue: orderDefaultValueRedcuer,
  others: othersReducer
});

const rootReducer = (state, action) => {
  if (action.type === UNAUTH_USER) {
    state = {};
  }

  return appReducer(state, action);
}

export default rootReducer;
