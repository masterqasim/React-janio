import React, { useContext } from 'react'
import { ShopifyOrderContext } from './SubmitOrderContext'
import classNames from 'classnames'

const ShopifyOrderSelect = () => {
  const context = useContext(ShopifyOrderContext)
  const { selectedOrder } = context

  const index = context.shopifyOrders.orders.findIndex(o => o.order_id === selectedOrder.order_id)

  return selectedOrder && Object.keys(selectedOrder).length ?
    <div style={{flex: 1}}>
      <span>Editing Shipment {index + 1} of {context.shopifyOrders.orders.length} {context.shopifyOrders.orders.length > 1 ? 'shipments':'shipment'}</span>
      <select className='custom-select mt-2' onChange={e => {
        context.setSelectedOrderId(parseInt(e.target.value, 10))
        context.firstPage()
      }} value={context.selectedOrderId}>
        {context.shopifyOrders.orders.map(order => {
          const customer = order.shopify_customer
          return (
          <option key={order.shopify_order_id} value={order.shopify_order_id}
            className={classNames(
              {'text-success font-weight-bold': order.submitted}
            )}>
            {order.order_name || order.order_id}
            {customer ? ' / ' + (`${customer.first_name} ${customer.last_name}`):''}
            {!customer && order.consignee_name && ` / ${order.consignee_name}`}
            {order.fulfilled && ' (fulfilled)'}
          </option>
          )
        })}
      </select>
    </div>
  :''
}

export default ShopifyOrderSelect