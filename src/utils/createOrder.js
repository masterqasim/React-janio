export const getPickupDataFromServiceDefinition = service => {
  const pickupData = {};
  pickupData.pickup_contact_name = service.dropoff_point_contact_person;
  pickupData.pickup_contact_number = service.dropoff_point_number;
  pickupData.pickup_state = service.dropoff_point_state;
  pickupData.pickup_city = service.dropoff_point_city;
  pickupData.pickup_province = service.dropoff_point_province;
  pickupData.pickup_postal = service.dropoff_postal;
  pickupData.pickup_address = service.dropoff_address;
  pickupData.pickup_country = service.dropoff_point_country
  return pickupData;
};

export const getPickupDataFromService = service => {
  const pickupData = {};
  pickupData.pickup_contact_name = service.pickup_contact_name;
  pickupData.pickup_contact_number = service.pickup_contact_number;
  pickupData.pickup_state = service.pickup_state;
  pickupData.pickup_city = service.pickup_city;
  pickupData.pickup_province = service.pickup_province;
  pickupData.pickup_postal = service.pickup_postal;
  pickupData.pickup_address = service.pickup_address;
  pickupData.pickup_country = service.pickup_country
  return pickupData;
};

export const getPickupDataFromPickupPoint = pickupPoint => {
  const pickupData = {};
  pickupData.pickup_contact_name = pickupPoint.pickup_point_contact_person;
  pickupData.pickup_contact_number = pickupPoint.pickup_point_number;
  pickupData.pickup_state = pickupPoint.pickup_point_state;
  pickupData.pickup_city = pickupPoint.pickup_point_city;
  pickupData.pickup_province = pickupPoint.pickup_point_province;
  pickupData.pickup_postal = pickupPoint.pickup_point_postal;
  pickupData.pickup_address = pickupPoint.pickup_point_address;
  pickupData.pickup_country = pickupPoint.pickup_point_country
  return pickupData;
};
