import React from 'react'

import SubmitOrderFormContainer from './forms/SubmitOrderFormContainer'
import SubmitOrderContextProvider from './SubmitOrderContext'
import SubmitSuccessModal from './SubmitSuccessModal'


const SubmitOrderContainer = () => (
  <div className="row">
    <div className="col-lg-10 offset-lg-1">
      <div className='p-4 border border-secondary my-5 jumbotron'>
      <SubmitOrderContextProvider>
        <SubmitSuccessModal />
        <SubmitOrderFormContainer />
      </SubmitOrderContextProvider>
      </div>
    </div>
  </div>
)

export default SubmitOrderContainer
