import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Trans, withNamespaces } from 'react-i18next'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import classNames from 'classnames'
import { withFormik, Form } from 'formik'
import slugify from 'slugify'
import * as yup from 'yup'

import { fetchService, fetchItemCategory, fetchAllCountries } from '../../actions/orderActions'
import { fetchPickupPoint } from '../../actions/pickupPointActions'
import { addOrderDefaultValue, updateOrderDefaultValue } from '../../actions/orderDefaultValueActions';
import { ClipLoader } from 'react-spinners';

const OrderDefaultValueForm = props => {
  const instance = props.data
  const { values, errors, touched, handleChange, isSubmitting, setFieldValue, setValues } = props

  const [secretKey, setSecretKey] = useState()
  if (!secretKey && props.shipperDetails && props.shipperDetails.agent_application_secret_key) {
    setSecretKey(props.shipperDetails.agent_application_secret_key)
  }

  useEffect(() => {
    if (secretKey) {
      props.fetchService(secretKey)
      props.fetchPickupPoint()
      props.fetchItemCategory()
      props.fetchAllCountries()
    }
  }, [secretKey])
  
  const getServiceOptions = () => {
    const result = []
    if (props.services && props.services.length) {
      const filteredServices = props.services.filter(s => s.pickup_country === values.pickup_country)
      filteredServices.forEach(s => {
        if (!result.some(r => r.value == s.service_id)) {
          result.push({
            value: s.service_id,
            label: s.service_name
          })
        }
      })
    }
    return result
  }

  const getPickupPointOptions = () => props.pickupPoints && props.pickupPoints.length ?
    props.pickupPoints.filter(s => s.pickup_point_country === values.pickup_country)
      .map(s => ({
        value: s.pickup_point_id,
        label: `${s.pickup_point_name} (${s.pickup_point_country})`
      })):[]
  
  const getItemCategoryOptions = () => props.itemCategories && props.itemCategories.length ?
    props.itemCategories.map(i => {
      const categorySlug = slugify(i, {
        lower: true
      })
      return {
        value: i,
        label: props.t(`data.categories.${categorySlug}`)
      }
    }):[]
  
  const getCountryOptions = () => props.countries && props.countries.length ?
    props.countries.map(c => ({
      value: c, label: c
    })):[]

  const getInitialValueDropdown = (field) => {
    return values[field] ? ({
      value: values[field], label: values[field]
    }):null
  }
  const getPickupPointInitialValue = () => {
    const pickupPointId = values.pickup_point
    const pickupPoint = props.pickupPoints && props.pickupPoints.length ?
      props.pickupPoints.filter(s => s.pickup_point_id === pickupPointId)[0]:null
    if (pickupPoint) {
      return {value: pickupPoint.pickup_point_id, label: pickupPoint.pickup_point_name}
    }
  }
  const getServiceInitialValue = () => {
    const serviceId = values.service
    const service = props.services && props.services.length ?
      props.services.filter(s => s.service_id === serviceId)[0]:null
    if (service) {
      return {value: service.service_id, label: service.service_name}
    }
  }
  const getService = id => {
    return props.services.filter(s => s.service_id ===id)[0]
  }
  const isDisabledPickupPoint = () => {
    const service = getService(values.service)
    return service ? service.service_category.includes('dropoff'):true
  }

  const [serviceSelected, setServiceSelected] = useState()
  const [pickupPointSelected, setPickupPointSelected] = useState()

  if (instance && instance.service && !serviceSelected) {
    setServiceSelected({
      value: instance.service.service_id,
      label: instance.service.service_name
    })
  }
  
  return (
    secretKey && props.pickupPoints && props.services ?
    <Form>
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="title"><Trans i18nKey='configureDefaultValues.title' /></label>
            <input type="text" name='title'
              className={classNames(
                'form-control',
                {'is-invalid': !!(touched.title && errors.title)}
              )}
            value={values.title}
            onChange={handleChange} autoFocus />
            {touched.title && errors.title &&<div className="invalid-feedback">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="pickup_country"><Trans i18nKey='orders.pickupCountry' /></label>
            <Select id="pickup_country"
              defaultValue={getInitialValueDropdown('pickup_country')}
              options={getCountryOptions()}
              placeholder={props.t('data.selectOne')}
              onChange={o => {
                setValues({
                  ...values,
                  pickup_country: o.value,
                  pickup_point: '',
                  service: ''
                })
                setServiceSelected(null)
                setPickupPointSelected(null)
              }} />
            {touched.pickup_country && errors.pickup_country &&<div className="invalid-text">{errors.pickup_country}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="service"><Trans i18nKey='orders.service' /></label>
            <Select id="service"
              defaultValue={getServiceInitialValue()}
              value={serviceSelected}
              options={getServiceOptions()}
              placeholder={props.t('data.selectOne')}
              onChange={o => {
                setServiceSelected(o)
                setPickupPointSelected(null)
                setValues({
                  ...values,
                  pickup_point: '',
                  service: o.value
                })
              }}
              isDisabled={(!values.pickup_country)}
              />
            {touched.service && errors.service &&<div className="invalid-text">{errors.service}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="pickupPoint"><Trans i18nKey='orders.pickupAddress' /></label>
            <Select name="pickupPoint"
              defaultValue={getPickupPointInitialValue()}
              options={getPickupPointOptions()}
              value={pickupPointSelected}
              placeholder={props.t('data.selectOne')}
              onChange={o => {
                setFieldValue('pickup_point', o.value)
                setPickupPointSelected(o)
              }}
              isDisabled={isDisabledPickupPoint()}
              />
            {touched.pickup_point && errors.pickup_point &&<div className="invalid-text">{errors.pickup_point}</div>}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <div className="d-flex">
            <div className="form-group mr-4">
              <label htmlFor="order_length"><Trans i18nKey='orders.orderLength' /></label>
              <input type="number" name='order_length' value={values.order_length}
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(touched.order_length && errors.order_length)}
                )} onChange={handleChange} />
              {touched.order_length && errors.order_length &&<div className="invalid-feedback">{errors.order_length}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="order_height"><Trans i18nKey='orders.orderHeight' /></label>
              <input type="number" name='order_height' value={values.order_height}
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(touched.order_height && errors.order_height)}
                )} onChange={handleChange} />
              {touched.order_height && errors.order_height &&<div className="invalid-feedback">{errors.order_height}</div>}
            </div>
          </div>
          <div className="d-flex">
            <div className="form-group mr-4">
              <label htmlFor="order_width"><Trans i18nKey='orders.orderWidth' /></label>
              <input type="number" name='order_width' value={values.order_width}
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(touched.order_width && errors.order_width)}
                )} onChange={handleChange} />
              {touched.order_width && errors.order_width && <div className="invalid-feedback">{errors.order_width}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="order_weight"><Trans i18nKey='orders.orderWeight' /></label>
              <input type="number" name='order_weight' value={values.order_weight}
                className={classNames(
                  'form-control',
                  {'is-invalid': !!(touched.order_weight && errors.order_weight)}
                )} onChange={handleChange} />
              {touched.order_weight && errors.order_weight && <div className="invalid-feedback">{errors.order_weight}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item_category"><Trans i18nKey='orders.itemCategory' /></label>
            <Select name="item_category"
              defaultValue={getInitialValueDropdown('item_category')}
              options={getItemCategoryOptions()}
              placeholder={props.t('data.selectOne')}
              onChange={o => {
                setFieldValue('item_category', o.value)
              }} />
            {touched.item_category && errors.item_category &&<div className="invalid-text">{errors.item_category}</div>}
          </div>
        </div>
      </div>

      {props.orderDefaultValue.addError && <div className="alert alert-danger mt-4">{JSON.stringify(props.orderDefaultValue.addError)}</div>}
      {props.orderDefaultValue.addSuccess && <div className="alert alert-success mt-4">Order default value submit success</div>}

      <button type="submit" className='btn btn-block btn-success btn-lg mt-4' disabled={isSubmitting}>
        {instance ? props.t('common.save'):props.t('common.submit')}
      </button>
      <Link to='/configure-default-values' className='btn btn-block btn-danger btn-lg mt-2' disabled={isSubmitting}><Trans i18nKey='common.cancel' /></Link>
    </Form>
    :
    <div className="center-screen">
      <ClipLoader />
    </div>
  )
}

const mapState = state => ({
  orderDefaultValue: state.orderDefaultValue,
  services: state.order.service,
  itemCategories: state.order.itemCategory,
  countries: state.order.countries,
  pickupPoints: state.pickupPoint.pickupPoints,
  shipperDetails: state.shipperDetails.shipperDetails
})

const mapDispatch = {
  fetchService,
  fetchPickupPoint,
  fetchItemCategory,
  addOrderDefaultValue,
  updateOrderDefaultValue,
  fetchAllCountries
}

export default connect(mapState, mapDispatch)(withNamespaces('common')(
  withFormik({
    async handleSubmit(values, {props, setErrors, setSubmitting}) {
      const instance = props.data
      values.secret_key = props.shipperDetails.agent_application_secret_key
      if (instance) {
        props.updateOrderDefaultValue(instance.id, values)
      } else {
        props.addOrderDefaultValue(values)
      }
    },
    validationSchema: props => {
      const required = props.t('common.required')

      return yup.object().shape({
        title: yup.string().required(required),
        service: yup.string(),
        pickup_country: yup.string().required(required),
        pickup_point: yup.string(),
        order_length: yup.number().required(required).typeError("Invalid number"),
        order_width: yup.number().required(required).typeError("Invalid number"),
        order_height: yup.number().required(required).typeError("Invalid number"),
        order_weight: yup.number().required(required).typeError("Invalid number"),
        item_category: yup.string().required(required),
      })
    },
    mapPropsToValues: props => {
      const instance = props.data
      return {
        title: instance && instance.title || '',
        service: instance && instance.service ? instance.service.service_id : '',
        pickup_country: instance && instance.pickup_country || '',
        pickup_point: instance && instance.pickup_point ? instance.pickup_point.pickup_point_id : '',
        order_length: instance && instance.order_length || '',
        order_width: instance && instance.order_width || '',
        order_height: instance && instance.order_height || '',
        order_weight: instance && instance.order_weight || '',
        item_category: instance && instance.item_category || '',
      }
    }
  })(OrderDefaultValueForm)
))