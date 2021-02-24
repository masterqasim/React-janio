import React from 'react'
import { withRouter } from "react-router-dom"
import { Trans } from 'react-i18next'
import { ShopifyOrderContext } from './ShopifyOrderContext'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'


const ShopifySuccessModal = ({ history }) => {
  const context = React.useContext(ShopifyOrderContext)
  const { selectedOrder, shopifyOrders } = context

  const handleClose = () => {
    console.log('close modal')
    context.setShowModal(false)
  }

  let actionBtns

  if (shopifyOrders.isShopify) {
    const allSubmitted = !context.shopifyOrders.orders.some(o => !o.submitted)
    const shipmentsUrl = '/view-orders'

    const nextOrder = () => {
      if (!allSubmitted) {
        const nextIndex = context.shopifyOrders.orders.findIndex(o => !o.submitted)
        const nextOrder = context.shopifyOrders.orders[nextIndex]
        context.setSelectedOrderId(nextOrder.order_id)
        context.setShowModal(false)
        context.firstPage()
      }
    }

    actionBtns = (
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          <Trans i18nKey='submitOrder.close' />
        </Button>

        {allSubmitted ?
        <Button color="primary" href={shipmentsUrl} target='_blank' rel="noopener noreferrer">
          Go to Manage Orders
        </Button>:
        <Button onClick={nextOrder} color="primary">
          Continue with the next shipment
        </Button>
        }
      </DialogActions>
    )
  } else {
    actionBtns = (
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          <Trans i18nKey='submitOrder.close' />
        </Button>
        <Button color="primary" onClick={() => {
          history.push('/view-orders')
        }}>
          <Trans i18nKey='submitOrder.goManageOrders' />
        </Button>
        <Button color="primary" onClick={() => {
          context.submitNewOrder()
        }}>
          <Trans i18nKey='submitOrder.submitNewOrder' />
        </Button>
      </DialogActions>
    )
  }

  return (
    <Dialog
      open={context.showModal}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title"><Trans i18nKey='submitOrder.shipmentCreated' /></DialogTitle>
      <DialogContent>
        <p><Trans i18nKey='submitOrder.shipmentCreatedCongrats' /></p>
        {selectedOrder && selectedOrder.submitted &&
        <p className="mb-0">
            <Trans i18nKey='submitOrder.goToManageOrders' />
        </p>
        }
      </DialogContent>
      
      {actionBtns}
    </Dialog>
  )
}

export default withRouter(ShopifySuccessModal)