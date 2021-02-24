import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { fetchOrderDefaultValues, deleteOrderDefaultValue } from '../../actions/orderDefaultValueActions'
import { ClipLoader } from 'react-spinners'
import OrderDefaultValueList from './OrderDefaultValueList'
import { Link } from 'react-router-dom'

const ConfigureDefaultValues = props => {
  const [secretKey, setSecretKey] = useState()

  if (!secretKey && props.shipperDetails && props.shipperDetails.agent_application_secret_key) {
    setSecretKey(props.shipperDetails.agent_application_secret_key)
  }

  useEffect(() => {
    if (secretKey) {
      props.fetchOrderDefaultValues(secretKey)
    }
  }, [secretKey])

  const {
    isError, fetched, isLoading, data
  } = props.orderDefaultValue

  const handleDelete = id => {
    props.deleteOrderDefaultValue(secretKey, id)
  }

  let content
  if (isLoading) {
    content = <div className='text-center'><ClipLoader /></div>
  } else if (fetched) {
    if (!data.length) {
      content = <p className='mb-0 text-center'>No data</p>
    } else if (isError) {
      content = <p className='mb-0 text-center'>Something went wrong</p>
    } else {
      content = <OrderDefaultValueList data={data} handleDelete={handleDelete} />
    }
  }

  return (
    <div className="col-md-6 offset-md-3 mt-5">
      {content}

      <Link to='/configure-default-values/add' className='btn btn-block btn-primary btn-success btn-lg mt-4'>
        <Trans i18nKey='configureDefaultValues.addDefaultValues' />
      </Link>
    </div>
  )
}

const mapState = state => ({
  orderDefaultValue: state.orderDefaultValue,
  shipperDetails: state.shipperDetails.shipperDetails
})
const mapDispatch = {
  fetchOrderDefaultValues,
  deleteOrderDefaultValue
}

export default connect(mapState, mapDispatch)(ConfigureDefaultValues)