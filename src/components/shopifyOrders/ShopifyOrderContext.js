import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import useServices from './hooks/useServices'
import useCountries from './hooks/useCountries'
import useShopifyOrders from './hooks/useShopifyOrders'
import { ROOT_URL, JANIO_LABEL_URL } from '../../actions'
import useStoreAddresses from './hooks/useStoreAddresses'
import useCurrencyMappings from './hooks/useCurrencyMappings'
import useItemCategories from './hooks/useItemCategories'
import useServiceDef from '../orderSubmitBulk/hooks/useServiceDef'
import { tabFieldsMapping } from './utils'

export const ShopifyOrderContext = React.createContext()


const ShopifyOrderContextProvider = props => {
  const [secretKey, setSecretKey] = useState()

  if (!secretKey && props.shipperDetails && props.shipperDetails.agent_application_secret_key) {
    setSecretKey(props.shipperDetails.agent_application_secret_key)
  }

  const tabs = [
    'senderDetails',
    'recipientDetails',
    'orderDetails',
    'otherInformation',
  ]
  const addresses = useStoreAddresses()
  const countries = useCountries()
  const [services, isServiceLoading] = useServices(secretKey)
  const [serviceDefinitions, isServicedefinitionLoading] = useServiceDef(secretKey)
  const itemCategories = useItemCategories()
  const [currencyMappings, isCurrencyMappingsLoading] = useCurrencyMappings()
  const agentApplicationName = props.shipperDetails ? props.shipperDetails.shipper_name : ""

  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState({
    submitted: false
  })
  const [shopifyOrders, setShopifyOrders] = useShopifyOrders()
  const [selectedOrderId, setSelectedOrderId] = useState()
  const [showModal, setShowModal] = useState(false)
  const [tabErrors, setTabErrors] = useState([])

  if (shopifyOrders.isShopify && shopifyOrders.orders.length && !selectedOrderId) {
    setSelectedOrderId(shopifyOrders.orders[0].shopify_order_id)
  }

  const getAvailablePickupCountries = () => services.map(s => s.pickup_country)
  const getAvailableConsigneeCountries = () => services.map(s => s.consignee_country)

  const getOrder = () => {
    const order = {
      submitted: false
    }
    if (shopifyOrders.isShopify) {
      return shopifyOrders.orders.filter(o => parseInt(o.shopify_order_id) === parseInt(selectedOrderId))[0] || order
    }
    return order
  }

  useEffect(() => {
    const order = getOrder()
    setSelectedOrder(order)
  }, [selectedOrderId])

  const nextPage = () => {
    setPage((page + 1) % tabs.length)
  }
  const prevPage = () => {
    setPage((page - 1 + tabs.length) % tabs.length)
  }
  const firstPage = () => {
    setPage(0)
  }
  
  const updateOrderData = data => {
    const order = selectedOrder
    Object.assign(order, data)
  }

  const selectShopifyOrder = orderId => {
    const order = shopifyOrders.orders.filter(o => o.order_id === parseInt(orderId, 10))[0]
    setSelectedOrder(order)
  }

  const validateToBackend = async values => {
    const data = {...selectedOrder, ...values}
    if (values.pickup_date) {
      values.pickup_date = values.pickup_date.format("YYYY-MM-DD")
    }
    const url = `${ROOT_URL}/order/order-validation/`
    setTabErrors([])

    const validationData = {...values}
    if (!validationData.service_id) {
      validationData.service_id = selectedOrder.service.service_id
    }

    try {
      const response = await axios.post(url, validationData)
      return response.data
    } catch(e) {
      console.log(e)
      const response = e.data || {}
      response.error = true
      return response
    }
  }

  const submitOrder = async values => {
    if (selectedOrder.pickup_date) {
      selectedOrder.pickup_date = selectedOrder.pickup_date.format("YYYY-MM-DD")
    }
    const data = {...selectedOrder, ...values}
    const url = `${ROOT_URL}/order/order/`
    setTabErrors([])

    const removeIfEmpty = ['cod_amt_to_collect', 'pickup_point_id', 'incoterm', 'additional_data']
    removeIfEmpty.forEach(i => {
      if (!data[i]) {
        delete data[i]
      }
    })

    const { pickup_point, service, serviceDefinition } = data
    if (pickup_point) {
      data.pickup_contact_name = pickup_point.pickup_point_contact_person
      data.pickup_contact_number = pickup_point.pickup_point_number
      data.pickup_state = pickup_point.pickup_point_state
      data.pickup_city = pickup_point.pickup_point_city
      data.pickup_province = pickup_point.pickup_point_province
      data.pickup_postal = pickup_point.pickup_point_postal
    } 
    else {
      data.pickup_contact_name = serviceDefinition.dropoff_point_contact_person
      data.pickup_contact_number = serviceDefinition.dropoff_point_number
      data.pickup_state = serviceDefinition.dropoff_point_state
      data.pickup_city = serviceDefinition.dropoff_point_city
      data.pickup_province = serviceDefinition.dropoff_point_province
      data.pickup_postal = serviceDefinition.dropoff_postal
    }

    if (shopifyOrders.isShopify) {
      data.additional_data = {}
      data.additional_data.shopifyOrder = data.shopify_order
    }

    try {
      const response = await axios.post(url, {...data, secret_key: secretKey})

      const updatedSelectedOrder = {...selectedOrder, ...values}
      updatedSelectedOrder.submitted = true
      updatedSelectedOrder.tracking_no = response.data.tracking_no
      updatedSelectedOrder.label_url = `${JANIO_LABEL_URL}/${updatedSelectedOrder.tracking_no},${updatedSelectedOrder.consignee_email || ''}`

      if (shopifyOrders.isShopify) {
        const index = shopifyOrders.orders.findIndex(o => o.order_id === updatedSelectedOrder.order_id)
        shopifyOrders.orders[index] = updatedSelectedOrder
        setShopifyOrders(shopifyOrders)
      }

      setSelectedOrder(updatedSelectedOrder)
      setShowModal(true)

      return response.data
    } catch(e) {
      console.log(e)
      const response = e.data
      response.error = true
      return response
    }
  }

  const setOrderDefaultValue = orderValue => {
    if (orderValue) {
      firstPage()
      const updatedOrder = {...selectedOrder, ...orderValue}
      const { item_category, service, pickup_point } = orderValue
      if (service && services.some(s => s.service_id == service.service_id)) {
        console.log('got the service')
        updatedOrder.service_id = service.service_id || ''
        updatedOrder.service = service
        if (!updatedOrder.consignee_country) {
          updatedOrder.consignee_country = service.service_destination_country
        }
      } else {
        updatedOrder.service_id = ''
        delete updatedOrder.service
      }
      updatedOrder.item_category = item_category || ''
      updatedOrder.pickup_point_id = pickup_point && pickup_point.pickup_point_id ? pickup_point.pickup_point_id:''
      updatedOrder.pickup_address = pickup_point ? pickup_point.pickup_point_address:service.pickup_address || ''
      console.log('updatedOrderupdatedOrder', updatedOrder)
      setSelectedOrder(updatedOrder)
    }
  }

  const getServiceById = id => {
    const service = services.filter(
      s => s.service_id === id
    )
    return service ? service[0] : null
  }

  const submitNewOrder = () => {
    firstPage()
    setSelectedOrder({submitted: false})
    setShowModal(false)
  }

  const data = {
    services, countries, itemCategories
  }

  const processError = (currentPage, errors) => {
    if (Object.keys(errors).length) {
      console.log('there are errors: ', errors)
      const errorFields = Object.keys(errors)
      const tabErrors = []

      for (let f of errorFields) {
        for (let k in tabFieldsMapping ) {
          if (k === currentPage) {
            continue
          }
          if (tabFieldsMapping[k].some(fieldMapping => f.includes(fieldMapping))) {
            tabErrors.push(k)
          }
        }
      }

      if (tabErrors.length) {
        setTabErrors(tabErrors)
      }
    }
  }

  const getPickupAddress = data => {
    if (data.pickup_point_id) {
      return {
        address: data.pickup_point_address,
        city: data.pickup_point_city,
        contact_person: data.pickup_point_contact_person,
        country: data.pickup_point_country,
        email: data.pickup_point_email,
        id: data.pickup_point_id,
        name: data.pickup_point_name,
        number: data.pickup_point_number,
        postal: data.pickup_point_postal,
        province: data.pickup_point_province,
        state: data.pickup_point_state,
      }
    } else if (data.dropoff_id) {
      return {
        address: data.dropoff_address,
        city: data.dropoff_point_city,
        contact_person: data.dropoff_point_contact_person,
        country: data.dropoff_point_country,
        email: data.dropoff_point_email,
        name: data.dropoff_point_name,
        number: data.dropoff_point_number,
        postal: data.dropoff_postal,
        province: data.dropoff_point_province,
        state: data.dropoff_point_state,
      }
    }
  }

  return (
    <ShopifyOrderContext.Provider
      value={{
        tabs,
        nextPage,
        prevPage,
        firstPage,
        setPage,
        page,
        data,
        addresses,
        showModal, setShowModal,
        isServiceLoading,
        serviceDefinitions, isServicedefinitionLoading,
        currencyMappings, isCurrencyMappingsLoading,
        agentApplicationName,

        shopifyOrders,
        selectedOrder,
        selectedOrderId,
        updateOrderData,
        selectShopifyOrder,
        getOrder,
        setSelectedOrderId, setSelectedOrder,
        validateToBackend,
        submitOrder,
        setOrderDefaultValue,
        getServiceById,
        getAvailableConsigneeCountries,
        getAvailablePickupCountries,
        submitNewOrder,
        tabErrors, setTabErrors,
        processError, getPickupAddress
      }}>
      {props.children}
    </ShopifyOrderContext.Provider>
  )
}

const mapState = state => ({
  shipperDetails: state.shipperDetails.shipperDetails
})

export default connect(mapState)(ShopifyOrderContextProvider)