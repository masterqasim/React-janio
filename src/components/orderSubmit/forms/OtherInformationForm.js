import React, { useState } from 'react'
import { Trans, withNamespaces } from 'react-i18next'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { ClipLoader } from 'react-spinners'
import { withFormik, Form } from 'formik'
import classNames from 'classnames'
import * as Yup from 'yup'

import packageImg from '../../../images/package.png'
import { COUNTRY_TO_CURRENCY } from '../../../utils/currency'


const getItemsTotalPrice = (items) => {
  let total = 0
  items.forEach(i => {
    total += (parseInt(i.item_quantity) * parseFloat(i.item_price_value))
  })
  return total
}


const OtherInformationForm = props => {
  const {ctx, values, errors, touched, status, handleChange, setFieldValue, isSubmitting} = props

  const { selectedOrder } = ctx
  const [showCod, setShowCod] = useState(values.payment_type === 'cod')

  return (
    <Form>
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
              disabled={selectedOrder.submitted} />
            {/* <small id="emailHelp" class="form-text text-muted">Help text tracking number field</small> */}
            {touched.tracking_no && errors.tracking_no &&
            <div className="invalid-feedback">{errors.tracking_no}</div>}
          </div>
        </div>
      </div>
    </div>

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
              <input type="number" id="order_length"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_width && touched.order_width)}
                )}
                name='order_length' onChange={handleChange} value={values.order_length}
                disabled={selectedOrder.submitted} />
              {touched.order_length && errors.order_length &&
              <div className="invalid-feedback">{errors.order_length}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_width"><Trans i18nKey='submitOrder.width' /></label>
              <input type="number" id="order_width"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_width && touched.order_width)}
                )}
                name='order_width' onChange={handleChange} value={values.order_width}
                disabled={selectedOrder.submitted} />
              {touched.order_width && errors.order_width &&
              <div className="invalid-feedback">{errors.order_width}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_height"><Trans i18nKey='submitOrder.height' /></label>
              <input type="number" id="order_height"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_width && touched.order_width)}
                )}
                name='order_height' onChange={handleChange} value={values.order_height}
                disabled={selectedOrder.submitted} />
              {touched.order_height && errors.order_height &&
              <div className="invalid-feedback">{errors.order_height}</div>}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="order_weight"><Trans i18nKey='submitOrder.weight' /></label>
              <input type="number" id="order_weight"
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.order_width && touched.order_width)}
                )}
                name='order_weight' onChange={handleChange} value={values.order_weight}
                onBlur={() => {
                  setFieldValue('order_weight', parseFloat(values.order_weight).toFixed(2))
                }}
                disabled={selectedOrder.submitted} />
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
              setFieldValue('cod_amt_to_collect', getItemsTotalPrice(selectedOrder.items))
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
            disabled={selectedOrder.submitted}
            />
          <label className="custom-control-label" htmlFor="incoterm-ddp"><Trans i18nKey="submitOrder.incotermDDP" /></label>
        </div>

        <div className="custom-control custom-radio ml-3">
          <input type="radio" className="custom-control-input"
            id="incoterm-ddu" name="incoterm" value='DDU'
            checked={values.incoterm === 'DDU'}
            onChange={handleChange}
            disabled={selectedOrder.submitted}
            />
          <label className="custom-control-label" htmlFor="incoterm-ddu"><Trans i18nKey="submitOrder.incotermDDU" /></label>
        </div>
      </div>
      </>
    }

    <div className="d-flex justify-content-between align-items-center mt-4 mb-0">
      <button className='btn btn-light' type='button' onClick={() => {
        ctx.prevPage()
      }} disabled={selectedOrder.submitted || isSubmitting}><Trans i18nKey='submitOrder.previousStep' /></button>
      {status && status.submitError && !isSubmitting && !selectedOrder.submitted && <span className="alert alert-danger mb-0">{status.submitError}</span>}
      <button className='btn btn-primary d-flex justify-content-center align-items-center'
        type='submit' disabled={selectedOrder.submitted || isSubmitting}>
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

const mapStateToProps = ({ shipperDetails }) => ({
  shipperDetails
})

export default withNamespaces('common')(
  compose(
  connect(mapStateToProps),
  withFormik({
    async handleSubmit(values, {props, setErrors, setSubmitting, setStatus}) {
      const secret_key = props.shipperDetails.shipperDetails.agent_application_secret_key

      setSubmitting(true)
      const { selectedOrder } = props.ctx
      const validationData = {...selectedOrder, ...values}
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

      values.secret_key = secret_key
      const createOrderResponse = await props.ctx.submitOrder(values)
      if (createOrderResponse.error) {
        if (createOrderResponse.message || createOrderResponse.non_field_errors) {
          setStatus({submitError: 'An error has occured, please contact Administrator.'})
        } else {
          setErrors(createOrderResponse)
        }
      }
      setSubmitting(false)
    },
    validationSchema: props => {
      const required = props.t('common.required')
      const { selectedOrder } = props.ctx
      const itemsTotalPrice = getItemsTotalPrice(selectedOrder.items)

      return Yup.lazy(values =>  {
        return Yup.object().shape({
          order_weight: Yup.number().required(required),
          order_height: Yup.number().required(required),
          order_width: Yup.number().required(required),
          order_length: Yup.number().required(required),

          payment_type: Yup.string().required(required),
          cod_amt_to_collect: Yup.number().min(0).max(itemsTotalPrice, `Can't greater than ${itemsTotalPrice}`)
      })
    })
    },
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
        tracking_no: '',
        incoterm: selectedOrder.pickup_country !== selectedOrder.consignee_country ? 'DDP':null
      }
    }
  }))(OtherInformationForm)
)