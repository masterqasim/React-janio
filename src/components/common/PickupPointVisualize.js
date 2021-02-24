import React from "react";

const PickupPointVisualize = React.memo(({ pickupData, date }) => {
  return (
    <div className="mt-3">
      <div>
        <div style={{ padding: 12 }} className="pickup-info-box">
          <strong>Pickup Date & Time</strong>
          <p className="mb-0">Date: {date && date.format('YYYY-MM-DD')}</p>
          <p className='mb-3'>Time: Timings are fixed between 1pm - 7pm</p>
          <strong>Pickup Location</strong>
          <p className='mb-3'>{pickupData.pickup_address}, {pickupData.pickup_postal},{" "}
            {pickupData.pickup_country}
          </p>
          <p className="mb-0">State: {pickupData.pickup_state}</p>
          <p className="mb-0">City: {pickupData.pickup_city}</p>
          <p className="mb-1">Province: {pickupData.pickup_province}</p>
          <p className="mb-0">Phone: {pickupData.pickup_contact_number}</p>
        </div>
      </div>
    </div>
  );
});

export default PickupPointVisualize;
