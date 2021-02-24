import axios from 'axios'
import { ROOT_URL } from '../actions';

const url = `${ROOT_URL}/shipper/order-default-values/`

const OrderDefaultValueAPI = {
  get: async (params={}) => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }
    
    const r = await axios.get(url, { params, headers })
    return r.data
  },

  getDetail: async (secret_key, id) => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }
    const params = { secret_key }
    const r = await axios.get(`${url}${id}/`, { params, headers })
    return r.data
  },

  add: async (data) => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }

    try {
      const r = await axios.post(url, data, { headers })
      return {data: r.data, success: true}
    } catch(e) {
      return {data: e.data, success: false}
    }
  },

  update: async (id, data) => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }

    try {
      const r = await axios.patch(`${url}${id}/`, data, { headers })
      return {data: r.data, success: true}
    } catch(e) {
      return {data: e.data, success: false}
    }
  },

  delete: async (secret_key, id) => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }
    const params = { secret_key }
    const r = await axios.delete(`${url}${id}/`, {params, headers})
    return {success: r.status == 204}
  }
}

export default OrderDefaultValueAPI