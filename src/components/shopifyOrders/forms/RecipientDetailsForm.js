import React, { useContext, useState } from 'react'
import { Trans, withNamespaces } from 'react-i18next'
import { Formik, Form } from 'formik'
import classNames from 'classnames'
import { ClipLoader } from "react-spinners"
import * as Yup from 'yup'
import Select from 'react-select'
import { AutoComplete } from 'antd';
import useCities from '../hooks/useCities'
import useStates from '../hooks/useStates'
import useCountryCode from '../../common/hooks/useCountryCode'
import { ShopifyOrderContext } from '../ShopifyOrderContext'


const RecipientDetailsForm = props => {
  const context = useContext(ShopifyOrderContext)
  const { selectedOrder, shopifyOrders, validateToBackend, updateOrderData, nextPage, prevPage } = context
  const [selectedState, setSelectedState] = useState("");
  const [cities] = useCities(selectedOrder.consignee_country, selectedState)
  const [states, statesLoading] = useStates(selectedOrder.consignee_country)
  const [countryCode, countryCodeLoading] = useCountryCode(selectedOrder.consignee_country)
  const mapPropsToValues = () => {
    return {
      consignee_name: selectedOrder.consignee_name || '',
      consignee_email: selectedOrder.consignee_email || '',
      consignee_number: (selectedOrder.consignee_number && selectedOrder.consignee_number.replace(/\D/g, '')) || '',
      consignee_state: selectedOrder.consignee_state || '',
      consignee_province: selectedOrder.consignee_province || '',
      consignee_postal: selectedOrder.consignee_postal || '',
      consignee_address: selectedOrder.consignee_address || '',
      consignee_city: selectedOrder.consignee_city || '',
      consignee_country: selectedOrder.consignee_country || (
        selectedOrder.service && selectedOrder.service.consignee_country
      )
    }
  }
  const validationSchema = () => {
    const required = props.t('common.required')
    const mustNumber = props.t('common.mustNumber')

    return Yup.object().shape({
      consignee_name: Yup.string().required(required),
      consignee_email: Yup.string().email('Must be a valid email'),
      consignee_number: Yup.string().required(required).matches(/^[0-9]*$/, mustNumber),
      consignee_state: Yup.string().required("Please select state"),
      consignee_province: Yup.string(),
      consignee_city: Yup.string().required("Please select city"),
      consignee_postal: Yup.string().required(required),
      consignee_address: Yup.string().required(required)
    })
  }
  const handleSubmit = async (values, {setErrors, setSubmitting}) => {
    if (!countryCode.country_calling_code) {
      setErrors({
        consignee_number: 'Invalid phone number'
      })
      return
    }
    const validationData = {
      ...values,
      pickup_country: selectedOrder.pickup_country,
      consignee_number: countryCode.country_calling_code + values.consignee_number
    }
    setSubmitting(true)
    const response = await validateToBackend(validationData)
    if (response.error) {
      setErrors(response)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    values.consignee_number = countryCode.country_calling_code + values.consignee_number
    updateOrderData(values)
    nextPage()
  }

  return (
    <Formik
      initialValues={mapPropsToValues()}
      validationSchema={validationSchema()}
      onSubmit={handleSubmit}
    >
      {formikProps => {
        const { values, errors, touched, isSubmitting, handleChange, setValues, setTouched } = formikProps
        return (
        <Form>
          {shopifyOrders.isShopify &&
          <p className="font-italic">*We auto-filled the recipient details based on your order data. Feel free to change anything here!</p>
          }

          <div className="row">
            <div className='col-md-4 col-xs-12'>
              <div className="form-group">
                <label htmlFor="consignee_name"><Trans i18nKey='submitOrder.name' /></label>
                <input type="text" className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.consignee_name && touched.consignee_name)}
                  )}
                  id="consignee_name" name="consignee_name"
                  onChange={handleChange} value={values.consignee_name}
                  disabled={selectedOrder.submitted} />
                {touched.consignee_name && errors.consignee_name &&
                <div className="invalid-feedback">{errors.consignee_name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="consignee_email"><Trans i18nKey='submitOrder.email' /></label>
                <input type="text" className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.consignee_email && touched.consignee_email && touched.consignee_email)}
                  )}
                  id="consignee_email" name="consignee_email"
                  onChange={handleChange} value={values.consignee_email}
                  disabled={selectedOrder.submitted} />
                {touched.consignee_email && errors.consignee_email &&
                <div className="invalid-feedback">{errors.consignee_email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="consignee_number"><Trans i18nKey='submitOrder.phone' /></label>
                <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    {countryCode.country_calling_code &&
                    <img src={`https://www.countryflags.io/${countryCode.country_code}/flat/16.png`} alt=""/>
                    }
                    <span style={{marginLeft: 8}}>{countryCode.country_calling_code}</span>
                  </div>
                </div>
                <input type="text"
                  className={classNames(
                    'form-control',
                      {'is-invalid': !!(errors.consignee_number && touched.consignee_number)}
                    )}
                  id="consignee_number" name="consignee_number"
                  onChange={e => {
                    const re = /^[0-9\b]+$/
                    if (e.target.value === '' || re.test(e.target.value)) {
                      handleChange(e)
                    }
                    return
                  }} value={values.consignee_number}
                  disabled={selectedOrder.submitted || countryCodeLoading}
                />
                {touched.consignee_number && errors.consignee_number &&
                <div className="invalid-feedback">{errors.consignee_number}</div>}
                </div>
              </div>
            </div>
          </div>

          <hr />
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="consignee_country"><Trans i18nKey='submitOrder.country' /></label>
                <input type="text" className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.consignee_country && touched.consignee_country)}
                  )}
                  id="consignee_country" name="consignee_country"
                  defaultValue={values.consignee_country}
                  disabled />
                {touched.consignee_country && errors.consignee_country &&
                <div className="invalid-feedback">{errors.consignee_country}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="consignee_state"><Trans i18nKey='submitOrder.state' /></label>
                <Select
                  disabled={selectedOrder.submitted}
                  name="consignee_state"
                  id="consignee_state"
                  isLoading={statesLoading}
                  placeholder = {props.t('submitOrder.selectState')}
                  className={classNames(
                    'basic-single',
                    {'is-invalid' : !!(errors.consignee_state && touched.consignee_state)}
                  )}
                  style={{width: 150}} onChange={e => {
                    setValues({
                      ...values,
                      consignee_state: e.label.split(', ')[0]
                    })
                    setSelectedState(e.label.split(', ')[0]);
                    setTouched({
                      consignee_state: true
                    })
                  }}
                  value={values.consignee_state ? {
                    value: values.consignee_state , label: values.consignee_state
                      }: ''}
                  options = {
                    states.map((city, i) => (
                      {'value': city.state_name, 'label': city.state_name}
                    ))
                  }>
                </Select>
                {touched.consignee_state && errors.consignee_state &&
                <div className="text-danger">{errors.consignee_state}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="consignee_city"><Trans i18nKey='submitOrder.city' /></label>
                <AutoComplete
                  disabled={selectedOrder.submitted}
                  name="consignee_city"
                  id="consignee_city"
                  className={classNames(
                    'form-control',
                    {'is-invalid': !!(errors.consignee_city && touched.consignee_city)}
                  )}
                  onChange={value => {
                    setValues({
                      ...values,
                      consignee_city: value
                    })
                    setTouched({
                      consignee_city: true
                    })
                  }}
                  value={values.consignee_city}
                  dataSource={cities.map((city, i) => {return city.city_name})}
                  filterOption={true}
                />
                {touched.consignee_city && errors.consignee_city &&
                <div className="text-danger">{errors.consignee_city}</div>}
              </div>

              {/* <div className="form-group">
                <label htmlFor="consignee_province">Province</label>
                <input type="text" className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.consignee_province && touched.consignee_province)}
                  )}
                  id="consignee_province" name="consignee_province"
                  onChange={handleChange} value={values.consignee_province}
                  disabled={selectedOrder.submitted} />
                {touched.consignee_province && errors.consignee_province &&
                <div className="invalid-feedback">{errors.consignee_province}</div>}
              </div> */}
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="consignee_postal"><Trans i18nKey='submitOrder.postalCode' /></label>
                <input type="text" style={{width: 100}}
                  className={classNames(
                    'form-control',
                    {'is-invalid': !!(errors.consignee_postal && touched.consignee_postal)}
                    )}
                  id="consignee_postal" name="consignee_postal"
                  onChange={handleChange} value={values.consignee_postal}
                  disabled={selectedOrder.submitted} />
                {touched.consignee_postal && errors.consignee_postal &&
                <div className="invalid-feedback">{errors.consignee_postal}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="consignee_address"><Trans i18nKey='submitOrder.address' /></label>
                <textarea className={classNames(
                  'form-control',
                  {'is-invalid': !!(errors.consignee_address && touched.consignee_address)}
                  )}
                  rows="4" id="consignee_address" name="consignee_address"
                  onChange={handleChange} value={values.consignee_address}
                  disabled={selectedOrder.submitted}></textarea>
                {touched.consignee_address && errors.consignee_address &&
                <div className="invalid-feedback">{errors.consignee_address}</div>}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button
              className='btn btn-light' type='button' onClick={() => prevPage() }
              disabled={selectedOrder.submitted || isSubmitting}
            >
              <Trans i18nKey='submitOrder.previousStep' />
            </button>
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
      }}
    </Formik>
  )
}

export default withNamespaces('common')(RecipientDetailsForm)
