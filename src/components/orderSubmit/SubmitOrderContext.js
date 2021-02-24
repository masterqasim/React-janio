import React, { useState } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import useServices from './hooks/useServices'
import useCountries from './hooks/useCountries'
import usePnpDropoff from './hooks/usePnpDropoff'
import { ROOT_URL, JANIO_LABEL_URL } from '../../actions'
import useStoreAddresses from './hooks/useStoreAddresses'

export const SubmitOrderContext = React.createContext()


const SubmitOrderContextProvider = (props) => {
  const { children } = props
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
  const [selectedOrder, setSelectedOrder] = useState({
    submitted: false
  })
  const [page, setPage] = useState(0)
  const [services, isServiceLoading] = useServices(secretKey)
  const countries = useCountries()
  const addresses = useStoreAddresses()
  const pnpDropoffs = usePnpDropoff()
  const [showModal, setShowModal] = useState(false)

  const getServiceById = id => {
    const service = services.filter(
      s => s.service_id == id
    )
    return service ? service[0] : null
  }

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
    Object.assign(selectedOrder, data)
  }

  const validateToBackend = async values => {
    if(values.pickup_date) {
      values.pickup_date = values.pickup_date.format("YYYY-MM-DD")
    }
    const url = `${ROOT_URL}/order/order-validation/`
    try {
      const response = await axios.post(url, {...values, service_id: selectedOrder.service.service_id})
      return response.data
    } catch(e) {
      const response = e.data || {}
      response.error = true
      return response
    }
  }

  const submitNewOrder = () => {
    firstPage()
    setSelectedOrder({submitted: false})
    setShowModal(false)
  }

  const submitOrder = async values => {
    if(values.pickup_date) {
      values.pickup_date = values.pickup_date.format("YYYY-MM-DD")
    }
    const data = {...selectedOrder, ...values}
    console.log('HELLO BITJ', data)
    const url = `${ROOT_URL}/order/order/`

    const removeIfEmpty = ['cod_amt_to_collect', 'pickup_point_id', 'incoterm']
    removeIfEmpty.forEach(i => {
      if (!data[i]) {
        delete data[i]
      }
    })
    const { pickup_point, service } = data



    if (pickup_point) {
      data.pickup_contact_name = pickup_point.pickup_point_contact_person
      data.pickup_contact_number = pickup_point.pickup_point_number
      data.pickup_state = pickup_point.pickup_point_state
      data.pickup_city = pickup_point.pickup_point_city
      data.pickup_province = pickup_point.pickup_point_province
      data.pickup_postal = pickup_point.pickup_point_postal
    } else {
      data.pickup_contact_name = service.pickup_contact_name
      data.pickup_contact_number = service.pickup_contact_number
      data.pickup_state = service.pickup_state
      data.pickup_city = service.pickup_city
      data.pickup_province = service.pickup_province
      data.pickup_postal = service.pickup_postal
    }

    try {
      const response = await axios.post(url, {...data})

      const updatedOrder = {...selectedOrder, ...values}
      updatedOrder.submitted = true
      updatedOrder.tracking_no = response.data.tracking_no
      updatedOrder.label_url = `${JANIO_LABEL_URL}/${updatedOrder.tracking_no},${updatedOrder.consignee_email || ''}`

      setSelectedOrder(updatedOrder)
      setShowModal(true)

      return response.data
    } catch(e) {
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
      if (service) {
        updatedOrder.service_id = service.service_id || ''
        updatedOrder.service = service
        updatedOrder.consignee_country = service.service_destination_country
      } else {
        updatedOrder.service_id = ''
      }
      updatedOrder.item_category = item_category || ''
      updatedOrder.pickup_point_id = pickup_point && pickup_point.pickup_point_id ? pickup_point.pickup_point_id:''
      updatedOrder.pickup_address = pickup_point ? pickup_point.pickup_point_address:service.pickup_address || ''
      setSelectedOrder(updatedOrder)
    }
  }

  const data = {
    services, countries
  }

  return (
    <SubmitOrderContext.Provider
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
        pnpDropoffs,

        updateOrderData,
        validateToBackend,
        submitOrder, submitNewOrder,
        setOrderDefaultValue,
        selectedOrder, setSelectedOrder,
        getServiceById
      }}>
      {children}
    </SubmitOrderContext.Provider>
  )
}

const mapState = state => ({
  shipperDetails: state.shipperDetails.shipperDetails
})

export default connect(mapState)(SubmitOrderContextProvider)