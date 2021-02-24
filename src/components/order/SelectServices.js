import React, { useMemo } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withNamespaces } from 'react-i18next'
import DropdownField from '../common/DropdownField'

const SelectService = props => {
  const { serviceValue, clearValue, onChange } = props

  const renderService = useMemo(() => {
    let options = [{
      serviceId: 0,
      value: 'All Services',
      label: props.t('common.allServices')
    }]
    if (!props.service) return options

    props.service.forEach(item => {
      options.push({
        serviceId: item.service_id,
        value: item.service_name,
        label: item.service_name
      });
    })

    return options
  }, [props.service])

  return useMemo(() =>
    <DropdownField fieldName='service' i18nKey='orders.service'
      placeholder={props.t('common.allServices')} clearValue={clearValue}
      labelClassName="my-2" dropdownClassName="mt-2 mb-3" disableLabel={true}
      onChange={onChange}
      value={serviceValue}
      renderItems={renderService} />
  , [serviceValue, props.service])
}

function mapStateToProps({ order }) {
  return ({
    service: order.service
  });
}

export default compose(
  connect(mapStateToProps),
  withNamespaces('common')
)(SelectService)