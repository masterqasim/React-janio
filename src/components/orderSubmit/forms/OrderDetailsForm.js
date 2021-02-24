import React from 'react'
import { Trans, withNamespaces } from 'react-i18next'
import { withFormik, Form, FieldArray } from 'formik'
import { ClipLoader } from "react-spinners"
import classNames from 'classnames'
import * as Yup from 'yup'
import { COUNTRY_TO_CURRENCY } from '../../../utils/currency'
import { VALID_CATEGORIES } from '../../../utils/data'

const initialItemProps = (currency, category) => ({
  item_desc: '',
  item_category: category || '',
  item_price_currency: currency || '',
  item_product_id: '',
  item_quantity: '',
  item_price_value: '',
  item_sku: '',
})

const OrderDetailsForm = props => {
  const { ctx, values, errors, touched, handleChange, isSubmitting, setFieldValue, setValues } = props
  const checkError = (index, prop) => {
    return (touched.items && errors.items) &&
    (touched.items[index] && errors.items[index]) &&
    (touched.items[index][prop] && errors.items[index][prop])
  }
  const { selectedOrder } = ctx
  let currencies = Object.values(COUNTRY_TO_CURRENCY).sort()
  currencies = [...new Set(currencies)]
  // const currency = COUNTRY_TO_CURRENCY[selectedOrder.consignee_country]
  const currency = values.items[0].item_price_currency
  
  return (
    <Form>
      <FieldArray
        name='items'
        render={arrayHelpers => (
          <React.Fragment>
          <div>
            <div className='mb-3' style={{borderBottom: '1px solid rgb(238, 238, 238)'}}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="shipper_order_id"><Trans i18nKey='submitOrder.orderId' /></label>
                  <input type="text" className={classNames(
                    'form-control',
                    {'is-invalid': !!(errors.shipper_order_id && touched.shipper_order_id)}
                    )}
                    id="shipper_order_id" name="shipper_order_id"
                    onChange={handleChange} value={values.shipper_order_id}
                    disabled={selectedOrder.submitted} />
                  {touched.shipper_order_id && errors.shipper_order_id &&
                  <div className="invalid-feedback">{errors.shipper_order_id}</div>}
                </div>
              </div>
            </div>
            </div>

            <h5><Trans i18nKey='submitOrder.itemsIncluded' /> ({values.items.length})</h5>
            {values.items.map((item, index) => (
              <div className="mt-4 order-create--item" style={{borderBottom: '1px solid #eee'}} key={index}>
                <div className="d-flex justify-content-between">
                  <h6><Trans i18nKey='submitOrder.item' /> #{index+1}</h6>

                  {(values.items.length > 1 && !selectedOrder.submitted) &&
                  <a href="/#" onClick={e => {
                    e.preventDefault()
                    arrayHelpers.remove(index)
                  }} className='order-create--remove-item'>
                    <i className="fas fa-times"></i>&nbsp;<Trans i18nKey='submitOrder.removeItem' />
                  </a>
                  }
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label><Trans i18nKey='submitOrder.category' /></label>
                      <select
                        name={`items.${index}.item_category`}
                        className={classNames(
                          'form-control',
                          {'is-invalid': checkError(index, 'item_category')}
                        )}
                        style={{width: 150}} onChange={handleChange} value={values.items[index].item_category}
                        disabled={selectedOrder.submitted}>
                        <option value="">{props.t('submitOrder.selectCategory')}</option>
                        {VALID_CATEGORIES.map((category, i) => {
                          const categoryKey = category.replace(' ', '')
                          return <option value={category} key={i}>{props.t(`data.categories.${categoryKey}`)}</option>
                        })}
                      </select>
                      {checkError(index, 'item_category') &&
                      <div className="invalid-feedback">{errors.items[index].item_category}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_category`}><Trans i18nKey='submitOrder.description' /></label>
                      <textarea type="text" className={classNames(
                        'form-control',
                        {'is-invalid': checkError(index, 'item_desc')}
                        )} id={`items.${index}.item_desc`}
                        name={`items.${index}.item_desc`} onChange={handleChange}
                        value={values.items[index].item_desc} style={{height: 110}}
                        disabled={selectedOrder.submitted}></textarea>
                      {checkError(index, 'item_desc') &&
                      <div className="invalid-feedback">{errors.items[index].item_desc}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_product_id`}><Trans i18nKey='submitOrder.productId' /></label>
                      <input type="text" className={classNames(
                        'form-control',
                        {'is-invalid': checkError(index, 'item_product_id')}
                        )} id={`items.${index}.item_product_id`}
                        name={`items.${index}.item_product_id`} onChange={handleChange}
                        value={values.items[index].item_product_id}
                        disabled={selectedOrder.submitted} />
                      {checkError(index, 'item_product_id') &&
                      <div className="invalid-feedback">{errors.items[index].item_product_id}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_quantity`}><Trans i18nKey='submitOrder.noOfUnits' /></label>
                      <input type="number" className={classNames(
                        'form-control',
                        {'is-invalid': checkError(index, 'item_quantity')}
                        )} id={`items.${index}.item_quantity`}
                        name={`items.${index}.item_quantity`}
                        onChange={handleChange}
                        onBlur={e => {
                          let value = e.target.value
                          const maxValue = values.items[index].fulfillable_quantity

                          if (value < 1) value = 1
                          if (value > maxValue) value = maxValue
                          setFieldValue(`items.${index}.item_quantity`, value)
                        }}
                        value={values.items[index].item_quantity}
                        disabled={selectedOrder.submitted}
                        />
                      {checkError(index, 'item_quantity') &&
                      <div className="invalid-feedback">{errors.items[index].item_quantity}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_price_currency`}><Trans i18nKey='submitOrder.currency' /></label>
                      <select name="pickup_point_id"
                        id={`items.${index}.item_price_currency`}
                        name={`items.${index}.item_price_currency`}
                        value={values.items[index].item_price_currency}
                        onChange={e => {
                          const val = e.target.value
                          const items = values.items.map(i => {
                            return {...i, item_price_currency: val}
                          })
                          setValues({
                            ...values,
                            items
                          })
                        }}
                        className={classNames(
                          'form-control',
                          {'is-invalid': checkError(index, 'item_price_currency')}
                        )}>
                        <option value="">{props.t('submitOrder.selectCurrency')}</option>
                        {currencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {checkError(index, 'item_price_currency') &&
                      <div className="invalid-feedback">{errors.items[index].item_price_currency}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_price_value`}><Trans i18nKey='submitOrder.itemPriceValue' /></label>
                      <input type="number" className={classNames(
                        'form-control',
                        {'is-invalid': checkError(index, 'item_price_value')}
                        )} id={`items.${index}.item_price_value`}
                        name={`items.${index}.item_price_value`} onChange={handleChange}
                        value={values.items[index].item_price_value}
                        disabled={selectedOrder.submitted} />
                      {checkError(index, 'item_price_value') &&
                      <div className="invalid-feedback">{errors.items[index].item_price_value}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`items.${index}.item_sku`}><Trans i18nKey='submitOrder.sku' /></label>
                      <input type="text" className={classNames(
                        'form-control',
                        {'is-invalid': checkError(index, 'item_sku')}
                        )} id={`items.${index}.item_sku`}
                        name={`items.${index}.item_sku`} onChange={handleChange}
                        value={values.items[index].item_sku}
                        disabled={selectedOrder.submitted} />
                      {checkError(index, 'item_sku') &&
                      <div className="invalid-feedback">{errors.items[index].item_sku}</div>}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {!selectedOrder.submitted ?
          <div className="list-item" style={{padding: '24px 0'}}>
            <a href="/#" className='d-flex align-items-center'
              onClick={(e) => {
                e.preventDefault()
                arrayHelpers.push(initialItemProps(currency, selectedOrder.item_category))
              }}>
              <i className="fas fa-plus"></i>&nbsp; <Trans i18nKey='submitOrder.addItem' />
            </a>
          </div>:''
          }
          </React.Fragment>
        )} />
      
      <div className="d-flex justify-content-between mt-4">
        <button className='btn btn-light' type='button' onClick={() => {
          ctx.prevPage()
        }} disabled={selectedOrder.submitted || isSubmitting}><Trans i18nKey='submitOrder.previousStep' /></button>
        <button className='btn btn-primary d-flex justify-content-center align-items-center' type="submit"
          disabled={isSubmitting || selectedOrder.submitted}>
          {isSubmitting ?
          <>
          <ClipLoader
            color={'#fff'}
            loading={true}
            size={16}
          /> <span className='ml-2'><Trans i18nKey='submitOrder.loading' /></span>
          </>:
          props.t('submitOrder.saveAndContinue')
          }
          </button>
      </div>
    </Form>
  )
}

export default withNamespaces('common')(
  withFormik({
    async handleSubmit(values, {props, setErrors, setSubmitting}) {
      setSubmitting(true)
      const { selectedOrder } = props.ctx
      const consignee = {
        consignee_name: selectedOrder.consignee_name,
        consignee_address: selectedOrder.consignee_address,
        consignee_country: selectedOrder.consignee_country,
        consignee_state: selectedOrder.consignee_state,
        consignee_number: selectedOrder.consignee_number,
        consignee_postal: selectedOrder.consignee_postal,
        consignee_city: selectedOrder.consignee_city,
        pickup_country: selectedOrder.pickup_country
      }
      // const updatedItems = values.items.map(i => {
      //   return {...i, item_price_currency: values.item_price_currency}
      // })
      const updatedValues = {...values}
      const validationData = {...updatedValues, ...consignee}
      const response = await props.ctx.validateToBackend(validationData)
      if (response.error) {
        setErrors(response)
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      props.ctx.updateOrderData(values)
      props.ctx.nextPage()
    },
    validationSchema: props => {
      const required = props.t('common.required')
      const mustNumber = props.t('common.mustNumber')

      return Yup.object().shape({
        items: Yup.array().of(Yup.object().shape({
          item_desc: Yup.string().required(required),
          item_quantity: Yup.number().typeError(mustNumber).min(1, 'Please enter more than 0').required(required),
          item_price_value: Yup.number().typeError(mustNumber).required(required),
          item_category: Yup.string().required(required),
          item_price_currency: Yup.string().required(required)
        })),
      })
    },
    mapPropsToValues: props => {
      const { selectedOrder } = props.ctx
      const currency = COUNTRY_TO_CURRENCY[selectedOrder.consignee_country]
      const initialItem = initialItemProps(currency, selectedOrder.item_category)

      let items = []
      if (selectedOrder && selectedOrder.items) {
        items = selectedOrder.items.map(item => {
          const item_category = item.item_category && VALID_CATEGORIES.includes(item.item_category) ?
            item.item_category : (selectedOrder.item_category || '' )
          const updatedItem = {...item, item_category}
          return {...initialItem, ...updatedItem}
        })
      } else {
        items = [initialItem]
      }
      return {
        items,
        item_price_currency: currency,
        shipper_order_id: selectedOrder.shipper_order_id || ''
      }
    },
    enableReinitialize: true
  })
  (OrderDetailsForm)
)