import React, { useContext } from 'react'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'

import SenderDetailsForm from './SenderDetailsForm'
import OrderDetailsForm from './OrderDetailsForm'
import OtherInformationForm from './OtherInformationForm'
import RecipientDetailsForm from './RecipientDetailsForm'
import { ShopifyOrderContext } from '../ShopifyOrderContext'
import OrderDefaultValueSelection from './OrderDefaultValueSelection';

const ShopifyOrderFormContainer = props => {
  const ctx = useContext(ShopifyOrderContext)
  const { selectedOrder, tabErrors } = ctx

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
      {!ctx.selectedOrder.submitted && <OrderDefaultValueSelection />}
      <ul className="nav nav-tabs">
        {ctx.tabs.map((tab, i) =>
          <li className="nav-item" key={i}>
            <a className={navClass(i)} href="#/"
              onClick={e => {
                e.preventDefault()
                if (selectedOrder.submitted) {
                  ctx.setPage(i)
                }
              }}>
              <span>{i+1}. {props.t(`submitOrder.tabs.${tab}`)}</span>
              {tabErrors.includes(tab) &&
              <i className="fa fa-exclamation-circle ml-2 text-danger"></i>
              }
            </a>
          </li>
        )}
      </ul>

      <div className='mt-4'>
        {forms[ctx.page]}
      </div>
    </div>
  )
}

export default withNamespaces('common')(ShopifyOrderFormContainer)