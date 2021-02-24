import React, { useContext } from 'react'
import { ShopifyOrderContext } from './ShopifyOrderContext'
import { JANIO_LABEL_URL } from '../../actions'

const FulfilledSelectedOrder = () => {
  const context = useContext(ShopifyOrderContext)
  const { selectedOrder } = context

  return (
    <div className='mt-4'>
      <p>Order has been fulfilled. Please see below for the labels:</p>
      <div>
        {selectedOrder.orders.map(o => {
          const labelUrl = `${JANIO_LABEL_URL}/${o.tracking_no},${o.consignee_email || ''}`
          return <p key={o.tracking_no}>{o.tracking_no} - <a href={labelUrl} target="_blank">{labelUrl}</a></p>
        })}
      </div>
    </div>
  )
}

export default FulfilledSelectedOrder