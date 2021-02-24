import React from 'react'

const PickupInformation = ({pickup, pickupDate, type}) => {
  console.log({ pickup, pickupDate })
  let title
  if (type.toLowerCase().includes('dropoff')) {
    title = 'Drop-off'
  } else {
    title = 'Pickup'
  }
  title += ' Information'

  return (
    <div>
      <label className="submit-title">{title}</label>
      <div style={{ padding: 12 }} className="pickup-info-box">
        {
          type.toLowerCase().includes('pickup') &&
          <>
          <strong>{ !!pickupDate ? 'Pickup Date & Time':'Pickup Time'}</strong>

          <div className="mb-3">
            {!!pickupDate && <p className='mb-0'>Date: {pickupDate.format('DD-MM-YY')}</p>}
            <p className='mb-0'>Time: Timings are fixed between 1pm - 7pm</p>
          </div>
          </>
        }

        <div className="mb-3">
          <strong>Contact Person</strong>
          <p className='mb-0'>Name: {pickup.pickup_contact_name}</p>
          <p className='mb-0'>Phone: {pickup.pickup_contact_number}</p>
        </div>

        <div>
          <strong>Pickup Location</strong>
          <p className='mb-3'>{pickup.pickup_address}</p>
          <p className='mb-0'>Postal Code: {pickup.pickup_postal}</p>
          <p className='mb-0'>State: {pickup.pickup_country}</p>
          <p className='mb-0'>City: {pickup.pickup_city}</p>
          <p className='mb-0'>Province: {pickup.pickup_province}</p>
        </div>
      </div>
    </div>
  )
}

export default PickupInformation
