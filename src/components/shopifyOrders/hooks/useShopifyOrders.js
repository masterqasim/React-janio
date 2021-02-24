import { useEffect, useState } from 'react'
import queryString from 'query-string'
import axios from 'axios'
import { ROOT_URL } from '../../../actions'

const useShopifyOrders = () => {
  const queries = queryString.parse(window.location.search)
  const { shop  } = queries
  const orderIds = queries['ids[]'] || queries.ids || queries.id
  const ids = orderIds instanceof Array ? orderIds.join():orderIds

  const [orders, setOrders] = useState({
    isShopify: shop && ids ? true : false,
    orders: []
  })

  useEffect(() => {
    const getShopifyOrders = async () => {
      const token = localStorage.getItem('token')
      try {
        const response = await axios.get(`${ROOT_URL}/shopify/get-orders/`,
          { params: {shop, ids, shopifyParams: window.location.search} },
          { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token } }
        )
        const orders = response.data.result
        setOrders({orders, isShopify: true, isEmpty: response.data.count === 0})
      } catch(err) {
        const response = err.data
        response.isError = true
        setOrders(response)
      }
    }

    getShopifyOrders()
  }, [ids, shop])
  
  if (!shop || !ids) {
    console.log('not shopify')
    return [{ isShopify: false }, setOrders]
  }

  return [orders, setOrders]
}

export default useShopifyOrders