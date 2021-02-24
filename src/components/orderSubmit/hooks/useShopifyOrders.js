import { useEffect, useState } from 'react'
import queryString from 'query-string'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useShopifyOrders = () => {
  const queries = queryString.parse(window.location.search)
  const shop = queries.shop
  const orderIds = queries['ids[]'] || queries.ids || queries.id
  const ids = orderIds instanceof Array ? orderIds.join():orderIds

  const [orders, setOrders] = useState([])

  useEffect(() => {
    const getShopifyOrders = async () => {
      const token = localStorage.getItem('token')
      try {
        const response = await axios.get(`${ROOT_URL}/shopify/get-orders/`,
          { params: {shop, ids} },
          { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
        )
        if (response.data.count) {
          const orders = response.data.result
          console.log(orders)
          setOrders(orders)
        } else {
          setOrders({isEmpty: true})
        }
      } catch(err) {
        const response = err.data
        response.isError = true
        setOrders(response)
      }
    }
    getShopifyOrders()
  }, [])

  return [orders, setOrders]
}

export default useShopifyOrders