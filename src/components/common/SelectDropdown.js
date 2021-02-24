import React, { useMemo } from 'react'
import Select from 'react-select'


const SelectDropdown = props => {
  const { dropdownClassName, labelClassName, textLabel } = props
  
  const renderItems = useMemo(() => {
    let options = [{
      value: '',
      label: props.placeholder
    }]
    if (!props.options) return options

    props.options.forEach(item => {
      let obj = props.optionObject ? props.optionObject(item): {value: item, label: item}
      options.push(obj)
    })
    return options
  }, [props.options])

  return useMemo(() =>
    <div className="w-100">
      {
        textLabel ?
          <label className={`h5 ${labelClassName || 'my-2'} font-weight-bold capitalize`}
            style={{color: 'rgba(0, 0, 0, 0.85)'}}>{textLabel}</label>
          :
          null
      }
      <Select
        className={dropdownClassName || 'mt-2 mb-3'}
        placeholder={props.placeholder}
        isMulti={props.isMulti}
        onChange={props.onChange}
        value={props.value}
        options={renderItems}
      />
    </div>,
    [props.value, props.options]
  )
}

export default SelectDropdown