import { INIT_FRESHWIDGET } from "./types";

export const initFreshWidget = () => {
  return (dispatch, getState) => {
    const state = getState()
    const { shipperDetails } = state.shipperDetails
    dispatch({
      type: INIT_FRESHWIDGET,
      payloaD: shipperDetails.shipper_email
    })
  }
}