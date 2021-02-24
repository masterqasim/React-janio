import React, { useEffect, useState, useContext } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Trans, withNamespaces } from 'react-i18next'
import { fetchOrderDefaultValues } from '../../../actions/orderDefaultValueActions'
import { SubmitOrderContext } from '../SubmitOrderContext'

const OrderDefaultValueSelection = props => {
  const context = useContext(SubmitOrderContext)
  const { selectedOrder } = context

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
    return options.map(o => (
      <option value={o.id} key={o.id}>{o.title}</option>
    ))
  }
  
  const handleChange = e => {
    const id = e.target.value
    const orderValue = props.orderDefaultValue.data.filter(o => o.id === parseInt(id))[0]
    console.log('orderValue', orderValue)
    context.setOrderDefaultValue(orderValue)
  }
  
  return (
    <div className="d-flex justify-content-between">
      <div style={{ width: 200 }}>
      <div className="form-group">
        <label><Trans i18nKey="submitOrder.selectDefaultValues" /></label>
        <select name="pickup_country" className="form-control"
          disabled={(!props.orderDefaultValue) || selectedOrder.submitted} onChange={handleChange}
          defaultValue=''>
          <option value='' disabled>{props.t("submitOrder.selectDefaultValuesPlaceholder")}</option>
          {getOptions()}
        </select>
      </div>
      </div>

      {selectedOrder.submitted &&
      <div>
        <p className="mb-0"><Trans i18nKey='submitOrder.shipmentCreated' /></p>
        <p className="mb-0">
          <a href={selectedOrder.label_url} target="_blank" rel="noopener noreferrer">
            <Trans i18nKey='submitOrder.downloadShippingLabel' />
          </a>
        </p>
        <p className="mt-3">
          <a href="#/" onClick={e => {
            e.preventDefault()
            context.submitNewOrder()
          }}><Trans i18nKey='submitOrder.submitNewOrder' /></a>
        </p>
      </div>
      }
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