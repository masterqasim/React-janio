import React, { useContext } from 'react'
import { withRouter } from "react-router-dom"
import { Trans } from 'react-i18next'
import { SubmitOrderContext } from './SubmitOrderContext'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'


const SubmitSuccessModal = ({ history }) => {
  const context = useContext(SubmitOrderContext)
  const { selectedOrder } = context
  
  const handleClose = () => {
    context.setShowModal(false)
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
            <a href={selectedOrder.label_url} target="_blank" rel="noopener noreferrer">
              <Trans i18nKey='submitOrder.downloadShippingLabel' />
            </a>
          </p>
          }
      </DialogContent>
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
    </Dialog>
  )
}

export default withRouter(SubmitSuccessModal)