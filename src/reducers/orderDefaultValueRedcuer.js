import {
  FETCH_ORDER_DEFAULT_VALUES,
  FETCH_ORDER_DEFAULT_VALUES_SUCCESS,
  FETCH_ORDER_DEFAULT_VALUES_ERROR,
  ORDER_DEFAULT_VALUES_ADD,
  ORDER_DEFAULT_VALUES_ADD_ERROR,
  ORDER_DEFAULT_VALUES_CLEAR,
  ORDER_DEFAULT_VALUES_DELETE,
  ORDER_DEFAULT_VALUES_UPDATE
} from '../actions/types'

const initialState = {
  isLoading: false,
  isError: false,
  error: null,
  fetched: false,
  addError: null,
  data: []
}

export default (state=initialState, action) => {
  let oldData
  let clonedData
  
  switch(action.type) {
    case FETCH_ORDER_DEFAULT_VALUES:
      return {...state, isLoading: true}
    case FETCH_ORDER_DEFAULT_VALUES_SUCCESS:
      return {...state, isLoading: false, isError: false, error: null, data: action.payload, fetched: true}
    case FETCH_ORDER_DEFAULT_VALUES_ERROR:
      return {...state, isLoading: false, error: action.error, isError: true, fetched: true}
    case ORDER_DEFAULT_VALUES_ADD:
      oldData = [...state.data]
      let updatedData = oldData.push(action.payload)
      return {...state, data: updatedData, addSuccess: true, addError: null}
    case ORDER_DEFAULT_VALUES_ADD_ERROR:
      return {...state, addError: action.payload, addSuccess: false}
    case ORDER_DEFAULT_VALUES_CLEAR:
      return {...state, addError: null, addSuccess: false}
    case ORDER_DEFAULT_VALUES_DELETE:
      let afterDelete = [...state.data].filter(o => o.id !== action.payload)
      return {...state, data: afterDelete}
    case ORDER_DEFAULT_VALUES_UPDATE:
      clonedData = [...state.data]
      const newData = action.payload
      const index = clonedData.findIndex(d => d.id === newData.id)
      clonedData[index] = newData
      return {...state, data: clonedData, addSuccess: true, addError: null}
    default:
      return state
  }
}
