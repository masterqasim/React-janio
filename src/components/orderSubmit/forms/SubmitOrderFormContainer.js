import React, { useContext } from 'react'
import { withNamespaces } from 'react-i18next'
import classNames from 'classnames'

import SenderDetailsForm from './SenderDetailsForm'
import OrderDetailsForm from './OrderDetailsForm'
import OtherInformationForm from './OtherInformationForm'
import RecipientDetailsForm from './RecipientDetailsForm'
import { SubmitOrderContext } from '../SubmitOrderContext'
import OrderDefaultValueSelection from './OrderDefaultValueSelection';

const SubmitOrderFormContainer = props => {
  const ctx = useContext(SubmitOrderContext)
  const { selectedOrder } = ctx

  const navClass = page => classNames(
    'nav-link',
    {'active': page === ctx.page,
    'disabled': !selectedOrder.submitted})
  const forms = [
    <SenderDetailsForm ctx={ctx} />,
    <RecipientDetailsForm ctx={ctx} />,
    <OrderDetailsForm ctx={ctx} />,
    <OtherInformationForm ctx={ctx} />,
  ]

  return (
    <div className='mt-4'>
      <OrderDefaultValueSelection />

      <ul className="nav nav-tabs">
        {ctx.tabs.map((tab, i) =>
          <li className="nav-item" key={i}>
            <a className={navClass(i)} href="#/"
              onClick={e => {
                e.preventDefault()
                if (selectedOrder.submitted) {
                  ctx.setPage(i)
                }
              }}>{i+1}. {props.t(`submitOrder.tabs.${tab}`)}</a>
          </li>
        )}
      </ul>

      <div className='mt-4'>
        {forms[ctx.page]}
      </div>
    </div>
  )
}

export default withNamespaces('common')(SubmitOrderFormContainer)