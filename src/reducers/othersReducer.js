import { INIT_FRESHWIDGET, DESTROY_FRESHWIDGET } from "../actions/types";

export default (state={}, action) => {
  switch(action.type) {
    case INIT_FRESHWIDGET:
      if (!state.initialized) {
        const email = action.payload
        window.initFreshWidget(email)
      }
      return {...state, initialized: true}
    case DESTROY_FRESHWIDGET:
      try {
        window.fw.destroy()
        window.FreshWidget = window.fw
      } catch(e) {}
    default:
      return state
  }
}