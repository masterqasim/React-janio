import { getPickupDataFromPickupPoint, getPickupDataFromService } from "../../utils/createOrder";

export const isNotClean = k => k.includes("(") && /[\s]+/g.test(k);
export const cleanKey = k => {
  let cleanedKey = k;
  if (k.includes("(")) {
    cleanedKey = k.substring(0, k.indexOf("(")).trim();
  }
  if (/[\s]+/g.test(k)) {
    cleanedKey = k.substring(0, k.indexOf(" ")).trim();
  }
  return cleanedKey;
};

export const getCleanedRawObjects = rawObjects => {
  const cleanedObjects = [];
  for (let object of rawObjects) {
    const cleanedObject = {};
    for (let key in object) {
      cleanedObject[cleanKey(key)] = object[key];
    }
    cleanedObjects.push(cleanedObject);
  }
  return cleanedObjects;
};

const getOrderItem = rawObject => {
  const {
    item_desc,
    item_quantity,
    item_product_id,
    item_sku,
    item_category,
    item_price_value,
    item_price_currency
  } = rawObject;
  return {
    item_desc,
    item_quantity,
    item_product_id,
    item_sku,
    item_category,
    item_price_value,
    item_price_currency
  };
};

export const getServiceDefinition = (agentApp, serviceDefinitions, selectedService, serviceType, dropoffPoint) => {
  if (serviceType === "Pickup"){
    let exclusive = serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === selectedService.origin &&
      serviceDef.destination_country === selectedService.destination &&
      serviceDef.service_type === "Pickup" &&
      serviceDef.exclusive_agents.includes(agentApp)
    )
    ).map(serviceDef =>(
      {service:{
        service_id: serviceDef.service_id,
        service_category: "pickup"
        }
      }
    )
    )

    if (exclusive.length > 0){
      return exclusive
    }{
      return serviceDefinitions.filter(serviceDef=>(
        serviceDef.origin_country === selectedService.origin &&
        serviceDef.destination_country === selectedService.destination &&
        serviceDef.service_type === "Pickup"
      )).map(serviceDef =>({service:
        {
          service_id: serviceDef.service_id,
          service_category: "pickup"
        }
      }))
  }
  }else if(serviceType.startsWith('Customs')){
    return serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === selectedService.origin &&
      serviceDef.destination_country === selectedService.destination &&
      serviceDef.service_type === serviceType
    )).map(serviceDefinition =>({service:
      {
        service_id: serviceDefinition.service_id,
        service_category: "dropoff",
        pickup_contact_name: serviceDefinition.dropoff_point_contact_person,
        pickup_contact_number: serviceDefinition.dropoff_point_number,
        pickup_state: serviceDefinition.dropoff_point_state,
        pickup_city: serviceDefinition.dropoff_point_city,
        pickup_province: serviceDefinition.dropoff_point_province,
        pickup_postal: serviceDefinition.dropoff_postal,
        pickup_address: serviceDefinition.dropoff_address,
        pickup_country: serviceDefinition.dropoff_point_country,
        serviceDefinition
      }
    }))
      
  }else {
    return serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === selectedService.origin &&
      serviceDef.destination_country === selectedService.destination &&
      serviceDef.dropoff_id === dropoffPoint.serviceDefinition.dropoff_id &&
      serviceDef.service_type === serviceType
    )).map(serviceDef =>({service:
      {
        service_id: serviceDef.service_id,
        service_category: "dropoff",
        pickup_contact_name: serviceDef.dropoff_point_contact_person,
        pickup_contact_number: serviceDef.dropoff_point_number,
        pickup_state: serviceDef.dropoff_point_state,
        pickup_city: serviceDef.dropoff_point_city,
        pickup_province: serviceDef.dropoff_point_province,
        pickup_postal: serviceDef.dropoff_postal,
        pickup_address: serviceDef.dropoff_address,
        pickup_country: serviceDef.dropoff_point_country,
      }
    }))
  }
}

export const getPickupData = (
  serviceValues,
  pickupCountry,
  consigneeCountry
) => {
  const originDest = `${pickupCountry}-${consigneeCountry}`;
  const serviceValue = serviceValues[originDest];
  const service = serviceValue.service.service;
  let pickupData = {
    service_id: service.service_id
  };
  if (service.service_category.includes("pickup")) {
    const pickupPoint =
      serviceValue.pickupPoint && serviceValue.pickupPoint.pickupPoint;
    pickupData = {
      ...pickupData,
      ...getPickupDataFromPickupPoint(pickupPoint),
      pickup_date: serviceValue.pickupDate ? serviceValue.pickupDate.format("YYYY-MM-DD") : null,
      pickup_notes: pickupPoint ? pickupPoint.pickup_point_notes : null,
    };
  } else {
    const serviceDef = serviceValue.dropoffPoint.serviceDefinition
    pickupData = { ...pickupData, ...getPickupDataFromService(service) };
    // add the parker id if the dropoff point is from parknparcel
    if (serviceDef.source === "parknparcel") {
      pickupData.additional_data = {"ParknParcel":serviceDef.additional_data}
    }
  }

  return pickupData;
};

export const getOrderObjects = (cleanedRawObjects, serviceValues) => {
  const finalResult = [];
  const removeIfEmpty = [
    "cod_amt_to_collect",
    "pickup_point_id",
    "incoterm",
    "additional_data"
  ];
  for (let obj of cleanedRawObjects) {
    const item = getOrderItem(obj);

    if (
      !!obj.shipper_order_id &&
      finalResult.some(o => o.shipper_order_id === obj.shipper_order_id)
    ) {
      // combine item if order already exists in finalResult
      const i = finalResult.findIndex(
        o => o.shipper_order_id === obj.shipper_order_id
      );
      const orderObject = finalResult[i];
      orderObject.items.push(item);
    } else {
      const pickupData = getPickupData(
        serviceValues,
        obj.pickup_country,
        obj.consignee_country
      );
      const orderObject = { ...obj, ...pickupData };
      orderObject.items = [item];
      removeIfEmpty.forEach(i => {
        if (!orderObject[i]) {
          delete orderObject[i];
        }
      });
      finalResult.push(orderObject);
    }
  }
  return finalResult;
};

export const formatErrorText = inputText => {
  let replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>'
  );

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>'
  );

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(
    replacePattern3,
    '<a href="mailto:$1">$1</a>'
  );

  // change field name to bold
  replacedText = replacedText.replace(
    /(\s)([a-z]+_[_a-z]+)([\s,\.])/g,
    "$1<b>$2</b>$3"
  );

  return replacedText;
};
