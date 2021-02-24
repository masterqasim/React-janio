import React, { useEffect, useState, useContext } from 'react'
import { connect } from 'react-redux'
import { fetchOrderDefaultValues } from '../../../actions/orderDefaultValueActions'
import { ShopifyOrderContext } from '../ShopifyOrderContext'
import { withNamespaces, Trans } from 'react-i18next'
import { compose } from 'recompose'

const OrderDefaultValueSelection = props => {
  const context = useContext(ShopifyOrderContext)

  const [secretKey, setSecretKey] = useState()
  if (!secretKey && props.shipperDetails && props.shipperDetails.agent_application_secret_key) {
    setSecretKey(props.shipperDetails.agent_application_secret_key)
  }
  useEffect(() => {
    if (secretKey) {
      props.fetchOrderDefaultValues(secretKey)
    }
  }, [secretKey])

  const getOptions = () => {
    let options = []
    if (props.orderDefaultValue && props.orderDefaultValue.data) {
      options = props.orderDefaultValue.data
    }
    if (context.shopifyOrders.isShopify && context.selectedOrder) {
      options = options.filter(o => o.service.service_destination_country.includes(
        context.selectedOrder.consignee_country
      ))
    }
    return options.map(o => (
      <option value={o.id} key={o.id}>{o.title}</option>
    ))
  }
  
  const handleChange = e => {
    const id = e.target.value
    const orderValue = props.orderDefaultValue.data.filter(o => o.id === parseInt(id))[0]
    context.setOrderDefaultValue(orderValue)
  }
  
  return (
    <div style={{ width: 200 }}>
    <div className="form-group">
      <label><Trans i18nKey="submitOrder.selectDefaultValues" /></label>
      <select name="pickup_country" className="form-control"
        disabled={(!props.orderDefaultValue)} onChange={handleChange}
        defaultValue=''>
        <option value='' disabled>{props.t("submitOrder.selectDefaultValuesPlaceholder")}</option>
        {getOptions()}
      </select>
    </div>
    </div>
  )
}

const mapState = state => ({
  orderDefaultValue: state.orderDefaultValue,
  shipperDetails: state.shipperDetails.shipperDetails
})

const mapDispatch = {
  fetchOrderDefaultValues,
}

export default compose(
  connect(mapState, mapDispatch),
  withNamespaces('common')
)(OrderDefaultValueSelection)