import React, { useContext } from 'react'

import ShopifyOrderFormContainer from './forms/ShopifyOrderFormContainer'
import ShopifyOrderContextProvider, { ShopifyOrderContext } from './ShopifyOrderContext'
import ShopifyOrderSelect from './ShopifyOrderSelect'
import ShopifySuccessModal from './ShopifySuccessModal';
import { ClipLoader } from 'react-spinners';
import FulfilledSelectedOrder from './FulfilledSelectedOrder';


const ShopifyOrderSubmitted = () => {
  const context = useContext(ShopifyOrderContext)
  
  return (
  <div style={{flex: 1}} className='text-right'>
    {context.selectedOrder && context.selectedOrder.submitted ?
      <>
      <h5 className='mb-0 text-success' style={{fontSize: '1rem'}}>
        <i className="fas fa-check mr-2"></i> Shipment has been created
      </h5>
      <a href={context.selectedOrder.label_url} target="_blank" rel="noopener noreferrer">Click here to print shipping label</a>
      </>:''
    }
  </div>
  )
}

const ContainerContent = () => {
  const context = useContext(ShopifyOrderContext)
  const { shopifyOrders, selectedOrder } = context
  console.log('shopifyOrders', shopifyOrders)

  let content = (
    <div className="center-screen">
      <ClipLoader color={"#000028"} loading={true} />
    </div>
  )

  if (shopifyOrders.isError) {
    content = (
      <div className="center-screen">
        <h1>This store is not associated to your account</h1>
      </div>
    )
    return content
  }

  if (shopifyOrders.isShopify) {
    if (shopifyOrders.isError) {
      content = (
        <div className="center-screen">
          <h1>This store is not associated to your account</h1>
        </div>
      )
    } else if (shopifyOrders.isEmpty) {
      content = (
        <div className="center-screen">
          <h1>Order(s) not found or already fulfilled</h1>
        </div>
      )
    } else if (shopifyOrders.orders.length && selectedOrder) {
      content = (
        <React.Fragment>
          <ShopifySuccessModal />
          <div className='row' style={{marginBottom: 64}}>
            <div className="col-md-8 offset-md-2 col-xs-12">
            <h4 className="mb-4">Create {shopifyOrders.orders.length > 1 ? 'Shipments':'Shipment'}</h4>
              <div className="card">
                <div className="card-body">
                  {shopifyOrders.isShopify &&
                  <div className='d-flex align-items-center'>
                    <ShopifyOrderSelect />
                    <ShopifyOrderSubmitted />
                  </div>
                  }
                  {selectedOrder.fulfilled ?
                  <FulfilledSelectedOrder />:
                  <ShopifyOrderFormContainer />
                  }
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    }
  } else {
    content = (
      <React.Fragment>
        <ShopifySuccessModal />
        <div className='row' style={{marginBottom: 64}}>
          <div className="col-md-8 offset-md-2 col-xs-12 mt-5">
            <div className="card">
              <div className="card-body">
                <div className='d-flex align-items-center'>
                  {shopifyOrders.isShopify ?
                  <ShopifyOrderSelect />
                  :
                  <div></div>
                  }
                  <ShopifyOrderSubmitted />
                </div>
                <ShopifyOrderFormContainer />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  return content
}

class ShopifyOrderContainer extends React.Component {
  render() {
    return (
      <ShopifyOrderContextProvider>
        <ContainerContent />
      </ShopifyOrderContextProvider>
    )
  }
}

export default ShopifyOrderContainer
