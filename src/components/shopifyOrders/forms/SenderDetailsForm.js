import React from 'react'
import { withFormik, Form } from 'formik'
import classNames from 'classnames'
import { ClipLoader } from 'react-spinners'
import * as Yup from 'yup'
import { Trans, withNamespaces } from 'react-i18next'
import Select from 'react-select';
import { DatePicker, Input } from 'antd';
// import useServiceDef from '../../orderSubmitBulk/hooks/useServiceDef';
import PickupInformation from '../../common/PickupInformation'
import { getPickupDataFromPickupPoint, getPickupDataFromServiceDefinition } from '../../../utils/createOrder'
// import { COUNTRY_TO_CURRENCY } from '../../../utils/currency'
// import useStoreAddresses from '../hooks/useStoreAddresses'

// const { TextArea } = Input;

const SenderDetailsForm = props => {
  const { ctx, values, errors, touched, setValues, setTouched, isSubmitting } = props
  const { selectedOrder, addresses, shopifyOrders, serviceDefinitions, isServicedefinitionLoading, agentApplicationName } = ctx
  const getAddress = pickupPointId => addresses.filter(a => a.pickup_point_id === parseInt(pickupPointId, 10))[0]

  const getServicesByConsignee = () => ctx.data.services.filter(
    s => s.consignee_country === values.consignee_country
  )
  const servicesByConsignee = getServicesByConsignee()

  const loadingDiv = (
    <div className="col-md-6">
      <ClipLoader color={"#000028"} loading={true} size={24} />
    </div>
  )

  const getFilteredServices = () => ctx.data.services.filter(
    s => s.pickup_country === values.pickup_country &&
         s.consignee_country === values.consignee_country
  )
  
  const filteredServices = getFilteredServices()
  
  const getServiceTypeOptions = (origin, destination)=>{
    return serviceDefinitions.filter(def=>origin === def.origin_country && destination === def.destination_country).map(serviceDef => serviceDef.service_type)
  .filter((value, index, self) => self.indexOf(value) === index).map(serviceType =>({value: serviceType, label:serviceType, serviceType}))
  }

  const getDropoffOptions = (origin, destination) =>{
    
    let exclusive = serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === origin &&
      serviceDef.destination_country === destination &&
      serviceDef.service_type === 'Dropoff' &&
      serviceDef.exclusive_agents.includes(agentApplicationName)
    ))
    if (exclusive.length > 0){
      return exclusive.map(serviceDefinition =>({
        label: serviceDefinition.dropoff_address,
        value: serviceDefinition.dropoff_id,
        serviceDefinition
      }))
    }else{
    return serviceDefinitions.filter(def => (origin === def.origin_country && destination === def.destination_country && def.service_type === 'Dropoff')).map(serviceDefinition =>({
        label: serviceDefinition.dropoff_address,
        value: serviceDefinition.dropoff_id,
        serviceDefinition
      }))
    }
  }

  const getFilteredServiceDefinitions = (origin, destination, serviceType, dropoffId) => {
    let exclusive = serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === origin &&
      serviceDef.destination_country === destination &&
      serviceDef.service_type === serviceType &&
      serviceDef.exclusive_agents.includes(agentApplicationName)&&
      (dropoffId ? serviceDef.dropoff_id === dropoffId :true)
    ))
    if (exclusive.length > 0){
      return exclusive
    }else{
      return serviceDefinitions.filter(serviceDef => (
        serviceDef.origin_country === origin &&
        serviceDef.destination_country === destination &&
        serviceDef.service_type === serviceType &&
        (dropoffId ? serviceDef.dropoff_id === dropoffId :true)
      ))
    }
  }

  let pickupAddress
  if (values.serviceType) {
    if (values.serviceType.toLowerCase().includes("pickup") && values.pickup_point) {
      pickupAddress = getPickupDataFromPickupPoint(values.pickup_point)
    }
    if (values.serviceType.toLowerCase().includes("dropoff") && values.serviceDefinition) {
      pickupAddress = getPickupDataFromServiceDefinition(values.serviceDefinition)
    }
  }

  let renderContent
  const content = !ctx.isServiceLoading && !isServicedefinitionLoading && !ctx.isCurrencyMappingsLoading ?
    <>
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label className="submit-title"><Trans i18nKey='submitOrder.selectPickupCountry' /></label>
              <Select name="pickup_country" className={classNames(
                'basic-single',
                {'is-invalid': !!(errors.pickup_country && touched.pickup_country)}
              )} style={{width: 150}}
                isSearchable = {true} 
                onChange={e => {
                  setValues({
                    pickup_country: e.value,
                    consignee_country: values.consignee_country,
                    service_id: '',
                    pickup_point_id: '',
                    pickup_address: '',
                    service: null
                  })
                  setTouched({
                    pickup_country: true
                  })
                  
                }} 
                value={values.pickup_country ? {
                  value: values.pickup_country, label: values.pickup_country
                }: ''}
                isDisabled={selectedOrder.submitted}
                options = {
                  ctx.data.countries.map((country, i) => (
                    {'value': country, 'label': country}
                  ))
                }
                > 
              </Select>
              {touched.pickup_country && errors.pickup_country &&
              <div className="invalid-feedback">{errors.pickup_country}</div>}
            </div>

          </div>
          <div className="col-md-6">
            {(!values.consignee_country || !shopifyOrders.isShopify) &&
            <div className="form-group">
              <label className="submit-title"><Trans i18nKey='submitOrder.selectConsigneeCountry' /></label>
              <Select disabled={(!values.pickup_country || selectedOrder.submitted)} name="consignee_country"
                className={classNames(
                  'basic-single',
                  {'is-invalid': !!(errors.consignee_country && touched.consignee_country)}
                )}
                style={{width: 150}} onChange={e => {
                  setValues({
                    pickup_country: values.pickup_country,
                    consignee_country: e.value,
                    service_id: '',
                    pickup_point_id: '',
                    pickup_address: '',
                  })
                  setTouched({
                    pickup_country: true,
                    consignee_country: true
                  })
                }} 
                value={values.consignee_country ? {
                  value: values.consignee_country, label: values.consignee_country
                }: ''}
                options = {
                    ctx.data.countries.map((country, i) => (
                      {'value': country, 'label': country}
                    ))
                  } >
              </Select>
              {touched.consignee_country && errors.consignee_country &&
              <div className="invalid-feedback">{errors.consignee_country}</div>}
            </div>
            }
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
          {values.pickup_country && values.consignee_country &&
            <React.Fragment>
              {filteredServices.length ?
                <div className="form-group">
                  <label className="submit-title"><Trans i18nKey='submitOrder.selectServicePlaceholder' /></label>
                  <Select disabled={(!values.pickup_country || selectedOrder.submitted)} name="service_type"
                    className={classNames(
                      'basic-single',
                    )}
                    style={{width: 150}} onChange={e => {
                      const filteredServiceDef = getFilteredServiceDefinitions(values.pickup_country, values.consignee_country, e.value)
                      if (filteredServiceDef.length === 1){
                        const serviceDef = filteredServiceDef[0]
                        values.service_id = serviceDef.service_id
                        values.service = ctx.getServiceById(serviceDef.service_id)
                        values.serviceDefinition = serviceDef
                        if (serviceDef.source === 'parknparcel'){
                          values.additional_data = {'ParknParcel': serviceDef.additional_data}
                        }
                      }else{
                        values.service_id = null
                        values.service = null
                        values.serviceDefinition = null
                      }
                      values.serviceType = e.value
                      setValues(values)
                      setTouched({
                        pickup_country: true,
                        service_id: true
                      })
                    }} 
                    value={values.serviceType ? {
                      value: values.serviceType, label: values.serviceType
                    }: ''}
                    options = {getServiceTypeOptions(values.pickup_country, values.consignee_country)} >
                  </Select>
                </div>
                :
                <p><Trans i18nKey='submitOrder.noServiceAvailable' /></p>
                }
            </React.Fragment>
          }
          </div>
        
          {values.service && values.serviceType === "Pickup" &&
          <div className="col-md-6">
            <div className='form-group'>
              <label className="form-label submit-title"><Trans i18nKey='submitOrder.selectPickupAddressPlaceholder' /></label>
              <select name="pickup_point_id" value={values.pickup_point_id}
                onChange={e => {
                  const pickup_point = getAddress(e.target.value)
                  setValues({
                    ...values, pickup_point_id: e.target.value,
                    pickup_address: pickup_point ? pickup_point.pickup_point_address :null,
                    pickup_notes: pickup_point ? pickup_point.pickup_point_notes : null,
                    pickup_point
                  })
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
          </div>
          }

          {values.serviceType === "Dropoff" &&
          <div className="col-md-6">
              <div className="form-group">
                <label className="submit-title"><Trans i18nKey='submitOrder.selectDropoffAddressPlaceholder' /></label>
                <Select disabled={(!values.pickup_country || selectedOrder.submitted)} name="dropoff_point"
                  className={classNames(
                    'basic-single',
                  )}
                  style={{width: 150}} onChange={e => {
                    const filteredServiceDef = getFilteredServiceDefinitions(values.pickup_country, values.consignee_country, "Dropoff", e.value)
                    if (filteredServiceDef.length === 1){
                      const serviceDef = filteredServiceDef[0]
                      values.service_id = serviceDef.service_id
                      values.service = ctx.getServiceById(serviceDef.service_id)
                      values.serviceDefinition = serviceDef
                      if (serviceDef.source === 'parknparcel'){
                        values.additional_data = {'ParknParcel': serviceDef.additional_data}
                      }
                    }
                    setValues(values)
                    setTouched({
                      pickup_country: true,
                      service_id: true
                    })
                  }} 
                  value={values.serviceDefinition ? {
                    value: values.serviceDefinition.dropoff_id, label: values.serviceDefinition.dropoff_address
                  }: ''}
                  options = {getDropoffOptions(values.pickup_country, values.consignee_country)} >
                </Select>
              </div>
          </div>
          }
        </div>

        <div className="row">
          {
            values.serviceType === "Pickup" &&
            ["Singapore", "Indonesia"].includes(values.pickup_country) &&
            values.pickup_address &&
          <div className="col-md-6">
            <div className="form-group">
              <label className="submit-title">Pickup Date (Optional)</label>
              <div>
                <DatePicker
                  size="large"
                  format="DD/MM/YY"
                  disabledDate={(currentDate) => {
                    const startDate = new Date()
                    if (startDate.getHours() >= 13) {
                      startDate.setDate(startDate.getDate() + 1)
                    }
                    return currentDate.diff(new Date(), 'days') >= 14 || currentDate.diff(startDate, 'days') < 0
                  }}
                  onChange={(val) => setValues({ ...values, pickup_date: val })}
                  style={{ width: "100%"}}
                  value={values.pickup_date}
                />
                {touched.pickup_date && errors.pickup_date && (
                  <span className="invalid-text">{errors.pickup_date}</span>
                )}
              </div>
            </div>
          </div>
          }

          {pickupAddress &&
          <div className="col-md-6">
              <PickupInformation
                pickup={pickupAddress}
                pickupDate={values.pickup_date}
                type={values.serviceType}
              />
          </div>
          }
        </div>

        <div className="row">
          {/* { values.serviceType === "Pickup" && values.pickup_country === "Singapore" && values.pickup_address &&
          <div className="col-md-6">
            <div className="form-group">
              <label className="submit-title">Pickup Notes (Optional)</label>
              <TextArea
                placeholder="Please let us know if you have any special pickup requests..."
                autosize={{ minRows: 6, maxRows: 6 }}
                onChange={(event) => setValues({ ...values, pickup_notes: event.target.value })}
                value={values.pickup_notes}
                style={{ height: "178px" }}
              />
            </div>
          </div>
          } */}
        </div>
        </div>

    </>
    :
    loadingDiv
  
  if (ctx.isServiceLoading || ctx.isCurrencyMappingsLoading || isServicedefinitionLoading) {
    renderContent = loadingDiv
  }
  if (shopifyOrders.isShopify) {
    if (selectedOrder.shopify_shipping_address_exists) {
      if (servicesByConsignee.length && !ctx.isServiceLoading && !ctx.isCurrencyMappingsLoading) {
       renderContent = content
     } else {
       renderContent = !ctx.isServiceLoading && !ctx.isCurrencyMappingsLoading ?
         <div className="col-md-6">
           <p>No service available to {values.consignee_country}</p>
         </div>
         :
         loadingDiv
     }
   } else {
     renderContent = (
       <div className="col-md-6">
         <p>Shipping address missing, please input shipping address in Shopify.</p>
       </div>
     )
   }
  } else {
    renderContent = content
  }
  console.log({ errors, touched })
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
            (values.serviceDefinition && !values.serviceDefinition.dropoff_id && !values.pickup_address) ||
            isSubmitting
          }>
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
      values.service_id = values.serviceDefinition.service_id
      if (values.service && values.serviceType !== "Pickup") {
        values.pickup_address = values.serviceDefinition.dropoff_address
      }

      const validationData = {
        pickup_country: values.pickup_country,
        pickup_date: values.pickup_date,
        service_id: values.service_id
      }
      setSubmitting(true)
      const response = await props.ctx.validateToBackend(validationData)
      if (response.error) {
        console.log('response', response)
        setErrors(response)
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      props.ctx.updateOrderData(values)
      props.ctx.nextPage()
    },
    mapPropsToValues: props => {
      const { selectedOrder } = props.ctx
      return {
        ...selectedOrder
      }
    },
    validationSchema: props => Yup.lazy(values => {
      const service = props.ctx.getServiceById(values.service_id)
      const required = props.t('common.required')
      return Yup.object().shape({
        pickup_country: Yup.string().required(required),
        consignee_country: Yup.string().required(required),
        service_id: Yup.string().required(required),
        pickup_point_id: values.service_id && values.serviceType === "Pickup" ?
          Yup.string().required(required) : Yup.string(),
        // address_id: values.service_category === 'pickup' ? Yup.string().required('Required'):Yup.string(),
        // dropoff_area: values.service_category === 'dropoff' ? Yup.string().required('Required'):Yup.string()
      })
    }),
    enableReinitialize: true
  })(SenderDetailsForm)
)