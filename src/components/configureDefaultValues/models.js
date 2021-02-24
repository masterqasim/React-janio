import OrderDefaultValueAPI from '../../api/orderDefaultValueAPI';

const orderDefaultValuesModel = {
  state: {
    loading: false,
    error: false,
    data: [],
  },

  reducers: {
    setValues(state, payload) {
      return {...state, data: payload}
    }
  },

  effects: dispatch => ({
    async getValues() {
      const data = await OrderDefaultValueAPI.get()
      dispatch.orderDefaultValues.setValues(data)
    }
  })
}

export default orderDefaultValuesModel