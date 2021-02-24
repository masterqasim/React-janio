import React from 'react'
import { Trans, withNamespaces } from 'react-i18next'
import { withFormik, Form } from 'formik'
import classNames from 'classnames'
import { ClipLoader } from "react-spinners"
import * as Yup from 'yup'


const RecipientDetailsForm = props => {
  const { values, errors, touched, isSubmitting, handleChange, ctx } = props
  const { selectedOrder } = ctx
  
  return (
  <Form>
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
          <input type="text" className={classNames(
            'form-control',
            {'is-invalid': !!(errors.consignee_number && touched.consignee_number)}
          )}
          id="consignee_number" name="consignee_number"
          onChange={handleChange} value={values.consignee_number}
          disabled={selectedOrder.submitted} />
          {touched.consignee_number && errors.consignee_number &&
          <div className="invalid-feedback">{errors.consignee_number}</div>}
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
          <label htmlFor="consignee_city"><Trans i18nKey='submitOrder.city' /></label>
          <input type="text" className={classNames(
            'form-control',
            {'is-invalid': !!(errors.consignee_city && touched.consignee_city)}
            )}
            id="consignee_city" name="consignee_city"
            onChange={handleChange} value={values.consignee_city}
            disabled={selectedOrder.submitted} />
          {touched.consignee_city && errors.consignee_city &&
          <div className="invalid-feedback">{errors.consignee_city}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="consignee_state"><Trans i18nKey='submitOrder.state' /></label>
          <input type="text" className={classNames(
            'form-control',
            {'is-invalid': !!(errors.consignee_state && touched.consignee_state)}
            )}
            id="consignee_state" name="consignee_state"
            onChange={handleChange} value={values.consignee_state}
            disabled={selectedOrder.submitted} />
          {touched.consignee_state && errors.consignee_state &&
          <div className="invalid-feedback">{errors.consignee_state}</div>}
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
      const { selectedOrder } = props.ctx
      const validationData = {...values, pickup_country: selectedOrder.pickup_country}
      setSubmitting(true)
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
      const { t } = props
      const required = t('common.required')
      const emailRequired = t('common.mustValidEmail')

      return Yup.object().shape({
        consignee_name: Yup.string().required(required),
        consignee_email: Yup.string().email(emailRequired),
        consignee_number: Yup.string().required(required),
        consignee_state: Yup.string().required(required),
        consignee_province: Yup.string(),
        consignee_city: Yup.string().required(required),
        consignee_postal: Yup.string().required(required),
        consignee_address: Yup.string().required(required)
      })
    },
    mapPropsToValues: props => {
      const { selectedOrder } = props.ctx
      return {
        consignee_name: selectedOrder.consignee_name || '',
        consignee_email: selectedOrder.consignee_email || '',
        consignee_number: selectedOrder.consignee_number || '',
        consignee_state: selectedOrder.consignee_state || '',
        consignee_province: selectedOrder.consignee_province || '',
        consignee_postal: selectedOrder.consignee_postal || '',
        consignee_address: selectedOrder.consignee_address || '',
        consignee_city: selectedOrder.consignee_city || '',
        // consignee_country: (selectedOrder.service && selectedOrder.service.consignee_country) ||
        //                     selectedOrder.consignee_country || ''
        consignee_country: selectedOrder.consignee_country || (
          selectedOrder.service && selectedOrder.service.consignee_country
        )
      }
    }
  })
  (RecipientDetailsForm)
)