import React, { useState } from 'react'
import { Trans, withNamespaces } from 'react-i18next'
import { ClipLoader } from 'react-spinners'
import { withFormik, Form } from 'formik'
import classNames from 'classnames'
import * as Yup from 'yup'

import packageImg from '../../../images/package.png'
import { COUNTRY_TO_CURRENCY } from '../../../utils/currency';
import Popup from "reactjs-popup";
import { findVal } from '../../../utils/data';
import { tabFieldsMapping } from '../utils'

const getItemsTotalPrice = (items) => {
  let total = 0
  items.forEach(i => {
    total += (parseInt(i.item_quantity) * parseFloat(i.item_price_value))
  })
  return total
}


const OtherInformationForm = props => {
  const {ctx, values, errors, touched, status, handleChange, setFieldValue, isSubmitting} = props
  const { selectedOrder, shopifyOrders } = ctx
  const [showCod, setShowCod] = useState(values.payment_type === 'cod')
  console.log({ touched, errors })

  const [openReweighPolicy, setOpenReweighPolicy] = useState(false);

  return (
    <Form>
    {!shopifyOrders.isShopify &&
    <div className='mb-3' style={{borderBottom: '1px solid rgb(238, 238, 238)'}}>
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="tracking_no"><Trans i18nKey='submitOrder.trackingNo' /></label>
            <input type="text" className={classNames(
              'form-control',
              {'is-invalid': !!(errors.tracking_no && touched.tracking_no)}
              )}
              id="tracking_no" name="tracking_no"
              onChange={handleChange} value={values.tracking_no}
              disabled={selectedOrder.submitted || isSubmitting} />
            {/* <small id="emailHelp" class="form-text text-muted">Help text tracking number field</small> */}
            {touched.tracking_no && errors.tracking_no &&
            <div className="invalid-feedback">{errors.tracking_no}</div>}
          </div>
        </div>
      </div>
    </div>
    }

    <h5><Trans i18nKey='submitOrder.packageDetails' /></h5>
    <div className="row mt-4">
      <div className="col-md-6">
        <img src={packageImg} alt="package" />
      </div>

      <div className="col-md-6">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_length"><Trans i18nKey='submitOrder.length' /></label>
              <input type="text" id="order_length"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_length && touched.order_length)}
                )}
                name='order_length' onChange={handleChange} value={values.order_length}
                disabled={selectedOrder.submitted || isSubmitting} />
              {touched.order_length && errors.order_length &&
              <div className="invalid-feedback">{errors.order_length}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_width"><Trans i18nKey='submitOrder.width' /></label>
              <input type="text" id="order_width"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_width && touched.order_width)}
                )}
                name='order_width' onChange={handleChange} value={values.order_width}
                disabled={selectedOrder.submitted || isSubmitting} />
              {touched.order_width && errors.order_width &&
              <div className="invalid-feedback">{errors.order_width}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_height"><Trans i18nKey='submitOrder.height' /></label>
              <input type="text" id="order_height"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_height && touched.order_height)}
                )}
                name='order_height' onChange={handleChange} value={values.order_height}
                disabled={selectedOrder.submitted || isSubmitting} />
              {touched.order_height && errors.order_height &&
              <div className="invalid-feedback">{errors.order_height}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_weight"><Trans i18nKey='submitOrder.weight' /></label>
              <input type="text" id="order_weight" step="any"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_weight && touched.order_weight)}
                )}
                name='order_weight' onChange={handleChange} value={values.order_weight}
                onBlur={e => {
                  setFieldValue('order_weight', parseFloat(e.target.value).toFixed(2))
                }}
                disabled={selectedOrder.submitted || isSubmitting} />
              {touched.order_weight && errors.order_weight &&
              <div className="invalid-feedback">{errors.order_weight}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr />
    <h5>Cash On Delivery (COD)</h5>
    <div className="mt-3 d-flex align-items-center">
        <p className='mb-0 mr-4'><Trans i18nKey='submitOrder.wouldYouLikeUsToCollectCash' /></p>
        {/* <div className="custom-control custom-radio">
          <input type="checkbox" className="custom-control-input" id="customCheckDisabled1"
            onChange={e => {
              setShowCod(e.target.checked)
              if (e.target.checked) {
                setFieldValue('cod_amt_to_collect', getItemsTotalPrice())
                setFieldValue('payment_type', 'cod')
              } else {
                setFieldValue('cod_amt_to_collect', '')
                setFieldValue('payment_type', 'prepaid')
              }
            }}
            checked={values.payment_type === 'cod'}
            disabled={selectedOrder.submitted} />
          <label className="custom-control-label" htmlFor="customCheckDisabled1">
            Would you like us to collect cash from the recipient?
          </label>
        </div> */}

        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input" id="cod-no" name="payment_type"
            checked={values.payment_type === 'prepaid' || !values.payment_type}
            disabled={selectedOrder.submitted || isSubmitting || (selectedOrder.service && !selectedOrder.service.allow_cod)}
            onChange={e => {
              setFieldValue('payment_type', 'prepaid')
              setFieldValue('cod_amt_to_collect', '')
              setShowCod(false)
            }}
          />
          <label className="custom-control-label" htmlFor="cod-no"><Trans i18nKey='submitOrder.no' /></label>
        </div>

        <div className="custom-control custom-radio ml-4">
          <input type="radio" className="custom-control-input" id="cod-yes" name="payment_type"
            checked={values.payment_type === 'cod'}
            disabled={selectedOrder.submitted || isSubmitting || (selectedOrder.service && !selectedOrder.service.allow_cod)}
            onChange={e => {
              setFieldValue('payment_type', 'cod')

              let codValue = ''
              if (selectedOrder.consignee_currency == values.cod_amt_to_collect_currency) {
                let itemsTotalPrice = getItemsTotalPrice(selectedOrder.items)
                if (shopifyOrders.isShopify) {
                  const shopifyTotalPrice = parseFloat(selectedOrder.shopify_order.total_price)
                  itemsTotalPrice = itemsTotalPrice < shopifyTotalPrice ? itemsTotalPrice : shopifyTotalPrice
                }
                codValue = itemsTotalPrice
              }

              setFieldValue('cod_amt_to_collect', codValue)
              setShowCod(true)
            }}
          />
          <label className="custom-control-label" htmlFor="cod-yes"><Trans i18nKey='submitOrder.yes' /></label>
        </div>
    </div>
    {showCod &&
    <div className="d-flex mt-3">
      <div className="form-group">
        <label htmlFor="staticEmail"><Trans i18nKey='submitOrder.currency' /></label>
        <input type="text" className="form-control"
          style={{width: 80}}
          value={values.cod_amt_to_collect_currency}
          disabled />
      </div>

      <div className="form-group ml-5">
        <label htmlFor="staticEmail"><Trans i18nKey='submitOrder.amount' /></label>
        <input type="number" name="cod_amt_to_collect"
          className={classNames(
            'form-control',
            {'is-invalid': !!(touched.cod_amt_to_collect && errors.cod_amt_to_collect)}
          )}
          value={values.cod_amt_to_collect}
          disabled={values.payment_type !== 'cod' || selectedOrder.submitted}
          onChange={handleChange}
          step='any' />
        {touched.cod_amt_to_collect && errors.cod_amt_to_collect &&
          <div className="invalid-feedback">{errors.cod_amt_to_collect}</div>}
      </div>
    </div>
    }

    {
      selectedOrder.pickup_country !== selectedOrder.consignee_country &&
      <>
      <hr />
      <h5><Trans i18nKey="submitOrder.incoterm" /></h5>
      <div className="d-flex mt-3">
        <div className="custom-control custom-radio">
          <input type="radio" className="custom-control-input"
            id="incoterm-ddp" name="incoterm" value='DDP'
            checked={values.incoterm === 'DDP'}
            onChange={handleChange}
            disabled={selectedOrder.submitted || isSubmitting}
            />
          <label className="custom-control-label" htmlFor="incoterm-ddp"><Trans i18nKey="submitOrder.incotermDDP" /></label>
        </div>

        <div className="custom-control custom-radio ml-3">
          <input type="radio" className="custom-control-input"
            id="incoterm-ddu" name="incoterm" value='DDU'
            checked={values.incoterm === 'DDU'}
            onChange={handleChange}
            disabled={selectedOrder.submitted || isSubmitting}
            />
          <label className="custom-control-label" htmlFor="incoterm-ddu"><Trans i18nKey="submitOrder.incotermDDU" /></label>
        </div>
      </div>
      </>
    }

    <hr />
    <h5 className="mb-3"><Trans i18nKey="submitOrder.shipmentReweighsPolicy" /></h5>
    <div className="d-flex flex-row">
      <div className="custom-control custom-checkbox mr-1">
        <input type="checkbox" id="declarationCheckbox" className="custom-control-input mr-2"
               name="declaration_checkbox" checked={values.declaration_checkbox} onChange={handleChange}/>
        <label className="custom-control-label" htmlFor="declarationCheckbox">
          <Trans i18nKey='submitOrder.reweighCheckboxText'/>
        </label>
      </div>
      <Popup
          trigger={<a href="#" style={{borderBottom: "1px dashed currentColor", textDecoration: 'none'}}><Trans i18nKey="submitOrder.whyIsThisNeeded" /></a>}
          position="top left"
          open={openReweighPolicy}
          onOpen={() => setOpenReweighPolicy(true)}
          contentStyle={{width: 280, height: 190, borderRadius: "5px", boxShadow: "5px 5px 15px darkgrey", borderWidth: 0}}
      >
        <div className="d-flex flex-column align-content-center">
          <label className="font-weight-bold m-3"><Trans i18nKey="submitOrder.shipmentReweighsPolicy" /></label>
          <label className="ml-3 mr-3" style={{fontSize: 13}}>
            <Trans i18nKey="submitOrder.shipmentReweighsPolicyText" />
          </label>
          <div className="d-flex justify-content-end mb-1">
            <button type="button" className="btn btn-primary mt-1 mr-3" onClick={() => setOpenReweighPolicy(false)}>
              <Trans i18nKey="submitOrder.gotIt" />
            </button>
          </div>
        </div>
      </Popup>
    </div>

    {
      status && Object.keys(status).length && !isSubmitting && !selectedOrder.submitted && (
        <div className="alert alert-danger mt-4">
          {Object.keys(status).map(k => (
            <p className="mb-0" key={k}>{k}: {status[k]}</p>
          ))}
        </div>
      )
    }

    <div className="d-flex justify-content-between align-items-center mt-4 mb-0">
      <button className='btn btn-light' type='button' onClick={() => {
        ctx.prevPage()
      }} disabled={selectedOrder.submitted || isSubmitting}><Trans i18nKey='submitOrder.previousStep' /></button>

      <button className={values.declaration_checkbox ? 'btn btn-primary d-flex justify-content-center align-items-center' : 'btn btn-secondary d-flex justify-content-center align-items-center'}
              type='submit' disabled={selectedOrder.submitted || isSubmitting || !values.declaration_checkbox}>
        {isSubmitting ?
        <>
        <ClipLoader
          color={'#fff'}
          loading={true}
          size={16}
        /> <span className='ml-2'><Trans i18nKey='submitOrder.submitting' /></span>
        </>:
        props.t('submitOrder.submit')
        }
      </button>
    </div>
  </Form>
  )
}

export default withNamespaces('common')(
    withFormik({
    async handleSubmit(values, {props, setErrors, setSubmitting, setStatus}) {
      setSubmitting(true)
      const currentPage = 'otherInformation'
      
      const { selectedOrder } = props.ctx
      const updatedValues = {...values}
      updatedValues.order_weight = parseFloat(updatedValues.order_weight).toFixed(2)
      const validationData = {...selectedOrder, ...updatedValues}
      if (!validationData.cod_amt_to_collect) {
        delete validationData.cod_amt_to_collect
      }
      
      const response = await props.ctx.validateToBackend(validationData)
      if (response.error) {
        if (response.message || response.non_field_errors) {
          setStatus({submitError: 'An error has occured, please contact Administrator.'})
        } else {
          setErrors(response)
        }
        setSubmitting(false)
        return
      }
      props.ctx.updateOrderData(values)

      const createOrderResponse = await props.ctx.submitOrder(values)
      console.log('createOrderResponse', createOrderResponse)
      if (createOrderResponse.error) {
        const otherPageErrors = {}
        const currentPageErrors = {}
        if (Object.keys(createOrderResponse).length) {
          const currentPageFields = tabFieldsMapping[currentPage]
          for (let k in createOrderResponse) {
            if (k === "orders") {
              for (let orderErrorField of createOrderResponse[k]) {
                for (let orderErrorFieldKey in orderErrorField) {
                  if (!currentPageFields.some(f => f.includes(orderErrorFieldKey))) {
                    otherPageErrors[orderErrorFieldKey] = orderErrorField[orderErrorFieldKey]
                  } else {
                    currentPageErrors[orderErrorFieldKey] = orderErrorField[orderErrorFieldKey]
                  }
                }
              }
            } else {
              if (!currentPageFields.some(f => f.includes(k)) && k !== 'error') {
                otherPageErrors[k] = createOrderResponse[k]
              }
            }
          }
          console.log({
            otherPageErrors, currentPageErrors
          })
          setErrors({...createOrderResponse, ...currentPageErrors})
          setStatus({ ...otherPageErrors })
        }
        props.ctx.processError(currentPage, createOrderResponse)
      }
      setSubmitting(false)
    },
    validationSchema: props => Yup.lazy(values => {
      const required = props.t('common.required')
      const mustNumber = props.t('common.mustNumber')
      // const shopifyOrder = selectedOrder.shopify_order
      // const itemsTotalPrice = shopifyOrder ? shopifyOrder.total_price : getItemsTotalPrice(selectedOrder.items)

      return Yup.object().shape({
        order_weight: Yup.number().typeError(mustNumber).required(required),
        order_height: Yup.number().typeError(mustNumber).required(required),
        order_width: Yup.number().typeError(mustNumber).required(required),
        order_length: Yup.number().typeError(mustNumber).required(required),

        payment_type: Yup.string().required(required),
        // cod_amt_to_collect: Yup.number().min(0).max(itemsTotalPrice, `Can't greater than ${itemsTotalPrice}`),
        cod_amt_to_collect: Yup.number().min(0),
        tracking_no: Yup.string()
    })
    }),
    mapPropsToValues: props => {
      const { selectedOrder } = props.ctx
      const currency = selectedOrder && (selectedOrder.cod_amt_to_collect_currency
          || COUNTRY_TO_CURRENCY[selectedOrder.consignee_country])

      return {
        order_weight: selectedOrder.order_weight || '',
        order_height: selectedOrder.order_height || '',
        order_width: selectedOrder.order_width || '',
        order_length: selectedOrder.order_length || '',

        // payment_type: selectedOrder.payment_type || 
        // ((selectedOrder.service && selectedOrder.service.allow_cod) ?
        // 'cod':'prepaid'),
        payment_type: selectedOrder.payment_type || 'prepaid',
        cod_amt_to_collect: selectedOrder.cod_amt_to_collect || '',
        cod_amt_to_collect_currency: currency,

        incoterm: selectedOrder.pickup_country !== selectedOrder.consignee_country ? 'DDP':null,
        tracking_no: selectedOrder.tracking_no || '',
        declaration_checkbox: false
      }
    }
  })(OtherInformationForm)
)