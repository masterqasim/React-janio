import {
  FETCH_INVOICES_WITH_FITLER,
  FETCH_INVOICES_WITH_FITLER_ERRORS,
  FETCH_INVOICES_PDF,
  FETCH_STATUSES,
  CLEAR_INVOICE_ERRORS
} from '../actions/types';
import moment from 'moment';

export default function(state = {}, action) {
  switch(action.type) {
    case FETCH_INVOICES_WITH_FITLER:
      return {
        ...state,
        invoices: action.payload,
        totalInvoices: action.payload.length,
        totalPages: Math.ceil(action.payload.length/50),
        lastUpdated: moment()
      };
    case FETCH_INVOICES_WITH_FITLER_ERRORS:
      return {
        ...state,
        errorData: action.errorData
      };
    case FETCH_INVOICES_PDF:
      return { ...state, invoicesPdf: action.payload, invoicesPdfStatus: action.invoicesPdfStatus };
    case FETCH_STATUSES:
      return { ...state, statuses: action.payload };
    case CLEAR_INVOICE_ERRORS:
      return { ...state, error: null, errorData: null, invoicesPdf: null, invoicesPdfStatus: null };
    default:
      return state;
  }
}
