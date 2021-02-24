import React from 'react'
import { withFormik, Form } from 'formik'
import classNames from 'classnames'
import { Trans, withNamespaces } from 'react-i18next'
import { ClipLoader } from 'react-spinners'
import * as Yup from 'yup'
// import { COUNTRY_TO_CURRENCY } from '../../../utils/currency'
// import useStoreAddresses from '../hooks/useStoreAddresses'


const SenderDetailsForm = props => {
  const {ctx, values, errors, touched, setValues, setTouched} = props
  const { addresses, selectedOrder, pnpDropoffs } = ctx
  const getAddress = pickupPointId => addresses.filter(a => a.pickup_point_id === parseInt(pickupPointId, 10))[0]
  const getPnpDropoff = parkerId => pnpDropoffs.filter(a => a.parker_id === parseInt(parkerId, 10))[0]

  const getServicesByConsignee = () => ctx.data.services.filter(
    s => s.consignee_country === values.consignee_country
  )

  const getFilteredServices = () => ctx.data.services.filter(
    s => s.pickup_country == values.pickup_country &&
         s.consignee_country === values.consignee_country
  )
  const filteredServices = getFilteredServices()

  // const getServiceCategories = () => {
  //   const categories = servicesByConsignee.filter(s => (
  //     s.pickup_country === values.pickup_country
  //   )).map(s => (
  //     `${s.service_category} - ${s.service_id}`
  //   ))
  //   return categories
  //   // return [...new Set(categories.map(item => item))]
  // }

  // const getService = () => {
  //   const services = ctx.data.services.filter(s => (
  //     s.pickup_country === values.pickup_country &&
  //     s.consignee_country === values.consignee_country &&
  //     s.service_id === parseInt(values.service_category.split(' - ')[1])
  //   ))
  //   return services[0]
  // }

  // const service = getService()
  // const serviceCategories = getServiceCategories()
  
  // useEffect(() => {
  //   setFieldValue('service', service || null)
  // }, [values.pickup_country, values.consignee_country, values.service_category])

  let renderContent
  if (ctx.isServiceLoading) {
    renderContent = (
      <div className="col-md-6">
        <ClipLoader color={"#000028"} loading={true} size={24} />
      </div>
    )
  } else {
    renderContent = (
      <div className="col-md-6">
        <div className="form-group">
          <label><Trans i18nKey='submitOrder.selectPickupCountry' /></label>
          <select name="pickup_country" className={classNames(
            'form-control',
            {'is-invalid': !!(errors.pickup_country && touched.pickup_country)}
          )} style={{width: 150}}
            onChange={e => {
              setValues({
                pickup_country: e.target.value,
                consignee_country: values.consignee_country,
                service_id: '',
                pickup_point_id: '',
                pickup_address: '',
                service: null
              })
              setTouched({
                pickup_country: true
              })
            }} value={values.pickup_country} disabled={selectedOrder.submitted}>
            <option value="">{props.t('submitOrder.selectCountryPlaceholder')}</option>
            {ctx.data.countries.map((country, i) => (
              <option value={country} key={i}>{country}</option>
            ))}
          </select>
          {touched.pickup_country && errors.pickup_country &&
          <div className="invalid-feedback">{errors.pickup_country}</div>}
        </div>

        <div className="form-group">
          <label><Trans i18nKey='submitOrder.selectConsigneeCountry' /></label>
          <select disabled={(!values.pickup_country || selectedOrder.submitted)} name="consignee_country"
            className={classNames(
              'form-control',
              {'is-invalid': !!(errors.consignee_country && touched.consignee_country)}
            )}
            style={{width: 150}} onChange={e => {
              setValues({
                pickup_country: values.pickup_country,
                consignee_country: e.target.value,
                service_id: '',
                pickup_point_id: '',
                pickup_address: '',
              })
              setTouched({
                pickup_country: true,
                consignee_country: true
              })
            }} value={values.consignee_country}>
            <option value="">{props.t('submitOrder.selectCountryPlaceholder')}</option>
            {ctx.data.countries.map((country, i) => (
              <option value={country} key={i}>{country}</option>
            ))}
          </select>
          {touched.consignee_country && errors.consignee_country &&
          <div className="invalid-feedback">{errors.consignee_country}</div>}
        </div>

        {values.pickup_country && values.consignee_country &&
          <React.Fragment>
          {filteredServices.length ?
          <div className="form-group">
            <label><Trans i18nKey='submitOrder.selectServicePlaceholder' /></label>
            <select disabled={(!values.consignee_country || !values.pickup_country || selectedOrder.submitted)}
              name="service_id"
              className={classNames(
                'form-control',
                {'is-invalid': !!(errors.service_id && touched.service_id)}
              )} style={{width: 250}}
              value={values.service_id}
              onChange={e => {
                const service = ctx.getServiceById(e.target.value)
                setValues({...values,
                  service_id: e.target.value,
                  service,
                  pickup_address: null,
                  pickup_point_id: '',
                })
                setTouched({
                  pickup_country: true,
                  service_id: true
                })
              }}>
              <option value="">{props.t('submitOrder.selectServicePlaceholder')}</option>
              {filteredServices.map(s => (
                <option value={s.service_id} key={s.service_id}>{s.service_name}</option>
              ))}
              </select>
              {touched.service_id && errors.service_id &&
            <div className="invalid-feedback">{errors.service_id}</div>}
          </div>
          :
          <p><Trans i18nKey='submitOrder.noServiceAvailable' /></p>
          }

          {values.service && values.service.service_category.includes('pickup') &&
          <div className='form-group'>
            <label className="form-label"><Trans i18nKey='submitOrder.selectPickupAddressPlaceholder' /></label>
            <select name="pickup_point_id" value={values.pickup_point_id}
              onChange={e => {
                const pickup_point = getAddress(e.target.value)
                setValues({...values, pickup_point_id: e.target.value, pickup_address: pickup_point.pickup_point_address, pickup_point})
              }}
              className={classNames(
                'custom-select',
                {'is-invalid': !!(errors.pickup_point_id && touched.pickup_point_id)})}
              disabled={selectedOrder.submitted}>
              <option value="">{props.t('submitOrder.selectPickupAddressPlaceholder')}</option>
              {addresses.filter(a => a.pickup_point_country === values.pickup_country)
              .map((a, i) => (
              <option key={i} value={a.pickup_point_id}>{a.pickup_point_name} - {a.pickup_point_address}</option>
              ))}
            </select>
            <p className='mb-0'>
              <a href="/add-pickup-point" target='_blank'>{props.t('submitOrder.addPickupPoint')}</a>
            </p>
            {touched.pickup_point_id && errors.pickup_point_id &&
            <div className="invalid-feedback">{errors.pickup_point_id}</div>}
          </div>
          }

          {values.service && values.service.service_category.includes('dropoff') && !values.service.service_name.includes('ParknParcel') &&
          <div className="mt-3">
            <div>
              <p className='mb-1' style={{color: '#538bc8'}}>{values.service.pickup_state}</p>
              <div style={{border: '1px solid #4783c5', padding: 12}}>
                <p className='mb-0'><strong>{values.service.pickup_contact_name}</strong></p>
                <p className='mb-0'>{values.service.pickup_address}, {values.service.pickup_postal}, {values.service.pickup_country}</p>
                <p className='mb-0'>Phone: {values.service.pickup_contact_number}</p>
              </div>
            </div>
          </div>
          }

          {values.service && values.service.service_name.includes('ParknParcel') &&
          <div className='form-group'>
          <label className="form-label">Select ParknParcel Dropoff Address</label>
          {/* <label className="form-label"><Trans i18nKey='submitOrder.selectPickupAddressPlaceholder' /></label> */}
          <select name="parker_id" value={values.additional_data ? values.additional_data.ParknParcel.parker_id : ''}
            onChange={e => {
              const pnpDropoff = getPnpDropoff(e.target.value)
              setValues({...values, pickup_address: pnpDropoff.dropoff_address, pickup_postal: pnpDropoff.dropoff_postal, additional_data: {ParknParcel: pnpDropoff}})
            }}
            className={classNames(
              'custom-select')}
            disabled={selectedOrder.submitted}>
            <option value="">Select ParknParcel Dropoff Address</option>
            {/* <option value="">{props.t('submitOrder.selectPickupAddressPlaceholder')}</option> */}
            {pnpDropoffs.map((a, i) => (
            <option key={i} value={a.parker_id}>{a.name} - {a.dropoff_address}</option>
            ))}
          </select>
          </div>
          }

        </React.Fragment>
        }
      </div>
    )
  }

  return (
    <Form>
      <div className="row">
      {renderContent}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <div></div>
        <button className='btn btn-primary' type='submit'
          disabled={
            selectedOrder.submitted || !filteredServices.length || !values.service ||
            (values.service && !values.service.pickup_address && !values.pickup_address)
          }><Trans i18nKey='submitOrder.saveAndContinue' /></button>
      </div>
    </Form>
  )
}

export default withNamespaces('common')(
  withFormik({
    handleSubmit(values, {props}) {
      values.service_id = values.service.service_id
      // values.consignee_currency = COUNTRY_TO_CURRENCY[values.consignee_country] || 'SGD'
      
      if (values.service && values.service.service_category.includes('dropoff') && !values.service.service_name.includes('ParknParcel')) {
        values.pickup_address = values.service.pickup_address
      }
      props.ctx.updateOrderData(values)
      props.ctx.nextPage()
    },
    mapPropsToValues: props => {
      const { selectedOrder } = props.ctx
      return {
        pickup_country: selectedOrder.pickup_country || '',
        consignee_country: selectedOrder.consignee_country || '',
        pickup_point_id: selectedOrder.pickup_point_id || '',
        pickup_address: selectedOrder.pickup_address || '',
        service: selectedOrder.service || null,
        service_id: selectedOrder.service_id || '',
        additional_data: selectedOrder.additional_data || '',
      }
    },
    validationSchema: props => Yup.lazy(values => {
      const service = props.ctx.getServiceById(values.service_id)
      const required = props.t('common.required')

      return Yup.object().shape({
        pickup_country: Yup.string().required(required),
        consignee_country: Yup.string().required(required),
        service_id: Yup.string().required(required),
        pickup_point_id: values.service_id && service.service_category.includes('pickup') ?
          Yup.string().required(required) : Yup.string(),
        // address_id: values.service_category === 'pickup' ? Yup.string().required('Required'):Yup.string(),
        // dropoff_area: values.service_category === 'dropoff' ? Yup.string().required('Required'):Yup.string()
      })
    }),
    enableReinitialize: true
  })
  (SenderDetailsForm)
)