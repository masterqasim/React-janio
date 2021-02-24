import React, { useState } from 'react'
import { connect } from 'react-redux'

import OrderDefaultValueForm from './OrderDefaultValueForm'
import OrderDefaultValueAPI from '../../api/orderDefaultValueAPI';
import { ClipLoader } from 'react-spinners';


const ConfigureDefaultValuesEdit = props => {
  const [dataDetail, setDataDetail] = useState()
  const id = props.match.params.id
  const { orderDefaultValue } = props
  const data = orderDefaultValue && orderDefaultValue.data.length ?
    orderDefaultValue.data.filter(o => o.id === id)[0]:null
  if (data) {
    setDataDetail(dataDetail)
  }
  
  const getData = async () => {
    const r = await OrderDefaultValueAPI.getDetail(secretKey, id)
    setDataDetail(r)
    return r
  }

  const [secretKey, setSecretKey] = useState()
  if (!secretKey && props.shipperDetails && props.shipperDetails.agent_application_secret_key) {
    setSecretKey(props.shipperDetails.agent_application_secret_key)
  }

  if (!dataDetail && secretKey) {
    getData()
  }
  console.log('dataDetail', dataDetail)

  return (
    <div className="col-md-4 offset-md-4 mt-5">
    {secretKey && dataDetail ?
      <OrderDefaultValueForm data={dataDetail} />
      :
      <div className="center-screen">
        <ClipLoader />
      </div>
    }
    </div>
  )
}

const mapState = state => ({
  orderDefaultValue: state.orderDefaultValue,
  shipperDetails: state.shipperDetails.shipperDetails
})

export default connect(mapState)(ConfigureDefaultValuesEdit)