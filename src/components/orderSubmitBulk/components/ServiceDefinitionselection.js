import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Formik, Form } from "formik";
import { withNamespaces } from "react-i18next";
import Select from "react-select";
import { DatePicker, Input } from 'antd';
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import * as yup from "yup";
import Popup from "reactjs-popup";
import PickupPointVisualize from "../../common/PickupPointVisualize";
import PickupInformation from "../../common/PickupInformation";
import { getServiceDefinition } from "../utils";
import DialogAddPickupPoint from "./DialogAddPickupPoint";
import {CustomPopUp} from './customPopUp'
import useServiceDef from '../hooks/useServiceDef'
import { getPickupDataFromPickupPoint, getPickupDataFromServiceDefinition } from "../../../utils/createOrder";

const { TextArea } = Input;


const ServiceDefinitionSelection = props => {
  const context = useContext(OrderSubmitBulkContext);
  const secretKey =
    (props.shipperDetails &&
      props.shipperDetails.agent_application_secret_key) ||
    "";
  const agentApplicationName =
    (props.shipperDetails &&
      props.shipperDetails.shipper_name) ||
    "";
  const [shipmentReweighsPolicy, setShipmentReweighsPolicy] = useState(false);
  const [openReweighPolicy, setOpenReweighPolicy] = useState(false);

  const [orderValueDeclaration, setOrderValueDeclaration] = useState(false);
  const [openOrderValueDeclaration, setOpenOrderValueDeclaration] = useState(
    false
  );
  const [serviceDefinitions, serviceDefinitionsLoading] = useServiceDef(secretKey, context.selectedServices.reduce((originCountries, serviceObj) => {
    if (!originCountries.origin_countries.includes(serviceObj.origin)){
      originCountries.origin_countries += `${serviceObj.origin},`
    }
    return originCountries
  },{origin_countries:''}))

  const [showAddPickupPointModal, setShowAddPickupPointModal] = useState(false);

  const getInitialValue = () => {
    const values = {};
    context.selectedServices.forEach((selectedService, index) => {
      const fieldName = `${selectedService.origin}-${selectedService.destination}`;
      values[fieldName] = {
        service: undefined,
        serviceDefinition: undefined,
        serviceType: undefined,
        dropoffPoint: undefined,
        pickupPoint: undefined,
        pickupDate: undefined
      };
    });
    return values;
  };
  const getValidationSchema = () => {
    const objects = {};
    context.selectedServices.forEach((selectedService, index) => {
      const fieldName = `${selectedService.origin}-${selectedService.destination}`;

      objects[fieldName] = yup.object().shape({
        service: yup.object().required("Required"),
        pickupPoint: yup.object().when("service", {
          is: value =>
            value &&
            value.service &&
            value.service.service_category.includes("pickup"),
          then: yup.object().required("Required")
        }),
        serviceDefinition: yup.array().required("Unable to find unique service.").max(1,"Unable to find unique service.")
      });
    });
    const schema = yup.object().shape(objects);
    return schema;
  };

  const getServiceTypeOptions = (selectedService)=>{
    return serviceDefinitions.filter(def=>selectedService.origin === def.origin_country && selectedService.destination === def.destination_country).map(serviceDef => serviceDef.service_type)
  .filter((value, index, self) => self.indexOf(value) === index).map(serviceType =>({value: serviceType, label:serviceType, serviceType}))
  }

  const getDropoffOptions = (selectedService) =>{
    let exclusive = serviceDefinitions.filter(serviceDef=>(
      serviceDef.origin_country === selectedService.origin &&
      serviceDef.destination_country === selectedService.destination &&
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
    return serviceDefinitions.filter(def => (selectedService.origin === def.origin_country && selectedService.destination === def.destination_country && def.service_type === 'Dropoff')).map(serviceDefinition =>({
        label: serviceDefinition.dropoff_address,
        value: serviceDefinition.dropoff_id,
        serviceDefinition
      }))
    }
  }

  const getServiceOptions = ({ origin, destination }) => {
    return props.services
      ? props.services
          .filter(
            service =>
              service.pickup_country == origin &&
              service.consignee_country === destination
          )
          .map(service => ({
            value: service.service_id,
            label: service.service_name,
            service
          }))
      : [];
  };
  const getPickupPointOptions = ({ origin, destination }) => {
    return props.pickupPoints
      ? props.pickupPoints
          .filter(pickupPoint => pickupPoint.pickup_point_country === origin)
          .map(pickupPoint => ({
            value: pickupPoint.pickup_point_id,
            label: `${pickupPoint.pickup_point_name} - ${pickupPoint.pickup_point_address}`,
            pickupPoint
          }))
      : [];
  };

  const onSubmit = (values, actions) => {
    context.submitBulkOrder(values);
  };

  return (
    <div>
      <DialogAddPickupPoint
        open={showAddPickupPointModal}
        onClose={() => setShowAddPickupPointModal(false)}
      />
    
      <p style={{ paddingTop: "20px"}}>
        Select pickup points for your orders. You may add more than one pickup
        points for each country pairings.
      </p>
      <Formik
        initialValues={getInitialValue()}
        validationSchema={getValidationSchema()}
        onSubmit={onSubmit}
      >
        {formikProps => {
          const {
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
            isValid
          } = formikProps;
          
          return (
            <Form>
              {context.selectedServices.map((selectedService, index) => {
                const fieldName = `${selectedService.origin}-${selectedService.destination}`;
                let pickupData;
                const dropoffPoint =
                  values[fieldName] && values[fieldName].dropoffPoint
                    ? values[fieldName].dropoffPoint
                    : null;
                const pickupPoint =
                  values[fieldName] && values[fieldName].pickupPoint
                    ? values[fieldName].pickupPoint.pickupPoint
                    : null;

                if (pickupPoint) {
                  pickupData = getPickupDataFromPickupPoint(pickupPoint);
                } else if (
                  dropoffPoint
                ) {
                  pickupData = getPickupDataFromServiceDefinition(dropoffPoint.serviceDefinition);
                }

                const showDropoffError = (
                  values[fieldName] &&
                  (values[fieldName].dropoffPoint || (serviceDefinitions.filter(serviceDef=>(
                    serviceDef.origin_country === selectedService.origin &&
                    serviceDef.destination_country === selectedService.destination &&
                    serviceDef.service_type === "Dropoff"
                  ))).length ===0) &&
                  errors[fieldName] &&
                  errors[fieldName].serviceDefinition
                )

                const dropoffSelection = (
                  <div>
                    <div className="form-group">
                      <label>
                        {props.t(
                          "submitOrder.selectDropoffAddressPlaceholder"
                        )}
                      </label>
              
                      <CustomPopUp 
                        message={'Choose a dropoff point to submit your orders.'} 
                        isOpen={false} 
                      />
              
                      <div style={{ display: "flex" }}>
                        <div style={{ width: "100%" }}>
                          <Select
                            isDisabled={showDropoffError}
                            isLoading={serviceDefinitionsLoading}
                            value={values[fieldName].dropoffPoint}
                            options={getDropoffOptions(selectedService)}
                            onChange={v => {
                              setFieldValue(
                                `${fieldName}.dropoffPoint`,
                                v
                              )
                              const filteredServiceDef = getServiceDefinition(agentApplicationName,serviceDefinitions,selectedService, values[fieldName].serviceType.serviceType, v)
                              setFieldValue(`${fieldName}.serviceDefinition`,filteredServiceDef)
                              setFieldValue(`${fieldName}.service`,filteredServiceDef[0])
                            }}
                          />
                        </div>
                      </div>
                      { showDropoffError&& (
                          <div className="invalid-text">
                            {errors[fieldName].serviceDefinition}
                          </div>
                        )}
                    </div>
                  </div>
                )
              
                const pickupSelection = (
                  <div>
                    <div className="form-group">
                      <label>
                        {props.t(
                          "submitOrder.selectPickupAddressPlaceholder"
                        )}
                      </label>
              
                      <CustomPopUp 
                        message={'Choose a pickup or dropoff point where your orders are collected.'} 
                        isOpen={false} 
                      />
              
                      <div style={{ display: "flex" }}>
                        <div style={{ width: "100%" }}>
                          <Select
                            isDisabled={errors[fieldName] && errors[fieldName].serviceDefinition}
                            value={values[fieldName].pickupPoint}
                            options={getPickupPointOptions(
                              selectedService
                            )}
                            onChange={v => {
                              setFieldValue(
                                `${fieldName}.pickupPoint`,
                                v
                                )
                              }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={e =>
                            setShowAddPickupPointModal(true)
                          }
                          className="btn btn-link"
                        >
                          Add
                        </button>
                      </div>
                      {
                        errors[fieldName] &&
                        errors[fieldName].serviceDefinition && (
                          <div className="invalid-text">
                            {errors[fieldName].serviceDefinition}
                          </div>
                        )}
                    </div>
                  </div>
                )

                return (
                  <div className="row mb-4" key={index}>
                    <div className="col-md-4">
                      <div>
                        <p
                          style={{
                            marginBottom: 0,
                            fontWeight: "bold",
                            fontSize: 15
                          }}
                        >
                          {`${selectedService.origin} to ${selectedService.destination}`}
                        </p>
                        <p>{props.t("bulkSubmit.totalOrders")}: {selectedService.count}</p>
                      </div>                      
                    </div>

                    <div className="col-md-8">
                    

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>
                              {props.t("submitOrder.selectServiceTypePlaceholder")}
                            </label>

                            <CustomPopUp 
                              message={'Choose a type of service available for the country pairing.'} 
                              isOpen={false} 
                            />
                            <Select
                              placeholder={props.t("bulkSubmit.nextButton")}
                              isLoading = {serviceDefinitionsLoading}
                              isDisabled = {serviceDefinitionsLoading}
                              value={values[fieldName].serviceType}
                              options={getServiceTypeOptions(selectedService)}
                              onChange={v => {
                                if (values[fieldName].dropoffPoint) {delete values[fieldName].dropoffPoint}
                                if (values[fieldName].pickupPoint) {delete values[fieldName].pickupPoint}
                                setFieldValue(`${fieldName}.serviceType`, v);
                                if (v.value === "Pickup"){
                                  let filteredServiceDef = getServiceDefinition(agentApplicationName, serviceDefinitions, selectedService, v.value, v)
                                  setFieldValue(
                                    `${fieldName}.serviceDefinition`,
                                    filteredServiceDef
                                    )
                                  setFieldValue(
                                    `${fieldName}.service`,filteredServiceDef[0]
                                    )
                                }else if (v.value.startsWith('Customs')){
                                  let filteredServiceDef = getServiceDefinition(agentApplicationName, serviceDefinitions, selectedService, v.value, v)
                                  setFieldValue(
                                    `${fieldName}.serviceDefinition`,
                                    filteredServiceDef
                                    )
                                  setFieldValue(
                                    `${fieldName}.service`,filteredServiceDef[0]
                                    )
                                  setFieldValue(
                                    `${fieldName}.dropoffPoint`,filteredServiceDef[0].service
                                    )
                                }
                              }}
                            />
                            
                            {touched[fieldName] &&
                                errors[fieldName] &&
                                errors[fieldName].serviceType && (
                                  <div className="invalid-text">
                                    {errors[fieldName].serviceType}
                                    </div>
                                  )}
                          </div>
                        </div>
                          {values[fieldName] &&
                          values[fieldName].serviceType &&
                          values[fieldName].serviceType.serviceType == 'Pickup' && (
                          <div className="col-md-6">
                            {pickupSelection}
                          </div>
                          )}
                          {values[fieldName] &&
                          values[fieldName].serviceType &&
                          values[fieldName].serviceType.serviceType == 'Dropoff' && (
                          <div className="col-md-6">
                            {dropoffSelection}
                          </div>
                          )}
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          {
                            values[fieldName] &&
                            values[fieldName].serviceType &&
                            values[fieldName].serviceType.serviceType === 'Pickup' && 
                            pickupData &&
                            selectedService.origin == 'Singapore' &&
                            <div className="form-group">
                              <label>Pickup Date (Optional)</label>
                              <div>
                                <DatePicker
                                  size="large"
                                  name="pickup_date"
                                  format="DD/MM/YY"
                                  disabledDate={(currentDate) => {
                                    const startDate = new Date()
                                    if (startDate.getHours() >= 13) {
                                      startDate.setDate(startDate.getDate() + 1)
                                    }
                                    return currentDate.diff(new Date(), 'days') >= 14 || currentDate.diff(startDate, 'days') < 0
                                  }}
                                  onChange={v => {setFieldValue(`${fieldName}.pickupDate`, v)}}
                                  style={{ width: "100%"}}
                                  value={values[fieldName].pickupDate}
                                />
                                {touched.pickup_date && errors.pickup_date && (
                                  <span className="invalid-text">{errors.pickup_date}</span>
                                )}
                              </div>
                            </div>
                          }
                        </div>

                        {pickupData && 
                          <div className="col-md-6">
                            <PickupInformation
                              pickup={pickupData}
                              pickupDate={values[fieldName].pickupDate}
                              title={`${values[fieldName].serviceType.serviceType} Information`}
                              type={values[fieldName].serviceType.serviceType}
                            />
                          </div>
                        }
                      </div>

                      {/* <div className="row">
                        <div className="col-md-6">
                          {
                            values[fieldName] &&
                            values[fieldName].serviceType &&
                            values[fieldName].serviceType.serviceType == 'Pickup' && pickupData && 
                            <div className="form-group">
                              <label>Pickup Notes (Optional)</label>
                              <div>
                                <TextArea
                                  placeholder="Please let us know if you have any special pickup requests..."
                                  autosize={{ minRows: 6, maxRows: 6 }}
                                  style={{ height: "178px" }}
                                  name="pickup_notes"
                                  value={values[fieldName].pickup_notes}
                                  onChange={v => {
                                    setFieldValue(
                                      `${fieldName}.pickup_notes`,
                                      v.target.value 
                                      )
                                    }}
                                />
                              </div>
                            </div>  
                          }
                        </div>
                      </div> */}
                    </div>
                </div>
                );
              })}

              <hr />
              <div style={{ marginTop: 50}}>
                <h3 style={{fontSize: "1.1rem", fontWeight:"bold", paddingBottom: 20}}>Shipment Reweighs Policy</h3>
                <div className="d-flex flex-row">
                  <div className="custom-control custom-checkbox mr-1">
                    <input
                      type="checkbox"
                      id="shipmentReweighsPolicy"
                      className="custom-control-input mr-2"
                      name="shipmentReweighsPolicy"
                      checked={shipmentReweighsPolicy}
                      onChange={e => {
                        setShipmentReweighsPolicy(e.target.checked);
                      }}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="shipmentReweighsPolicy"
                    >
                      {props.t("submitOrder.reweighCheckboxText")}
                    </label>
                  </div>

                  <Popup
                    trigger={
                      <a
                        style={{
                          borderBottom: "1px dashed currentColor",
                          textDecoration: "none"
                        }}
                        onClick={e => {
                          e.preventDefault();
                          setOpenReweighPolicy(true);
                        }}
                      >
                        {props.t("submitOrder.whyIsThisNeeded")}
                      </a>
                    }
                    position="top left"
                    open={openReweighPolicy}
                    onOpen={() => setOpenReweighPolicy(true)}
                    contentStyle={{
                      width: 280,
                      height: 190,
                      borderRadius: "5px",
                      boxShadow: "5px 5px 15px darkgrey",
                      borderWidth: 0
                    }}
                  >
                    <div className="d-flex flex-column align-content-center">
                      <label className="font-weight-bold m-3">
                        <span>
                          {props.t("submitOrder.shipmentReweighsPolicy")}
                        </span>
                      </label>
                      <label className="ml-3 mr-3" style={{ fontSize: 13 }}>
                        {props.t("submitOrder.shipmentReweighsPolicyText")}
                      </label>
                      <div className="d-flex justify-content-end mb-1">
                        <button
                          type="button"
                          className="btn btn-primary mt-1 mr-3"
                          onClick={() => setOpenReweighPolicy(false)}
                        >
                          {props.t("submitOrder.gotIt")}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </div>
              </div>

              <div style={{ marginTop: 50 }}>
                <h3 style={{fontSize: "1.1rem", fontWeight:"bold", paddingBottom: 20}}>Order Value Declaration</h3>
                <div className="d-flex flex-row">
                  <div className="custom-control custom-checkbox mr-1">
                    <input
                      id="orderValueDeclaration"
                      type="checkbox"
                      className="custom-control-input mr-2"
                      name="declaration_checkbox"
                      checked={orderValueDeclaration}
                      onChange={e => {
                        setOrderValueDeclaration(e.target.checked);
                      }}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="orderValueDeclaration"
                    >
                      {props.t("submitOrder.declarationBulkCheckboxText")}
                    </label>
                  </div>

                  <Popup
                    trigger={
                      <a
                        style={{
                          borderBottom: "1px dashed currentColor",
                          textDecoration: "none"
                        }}
                        onClick={e => {
                          e.preventDefault();
                          setOpenOrderValueDeclaration(true);
                        }}
                      >
                        {props.t("submitOrder.whyIsThisNeeded")}
                      </a>
                    }
                    position="top left"
                    open={openOrderValueDeclaration}
                    onOpen={() => setOpenOrderValueDeclaration(true)}
                    contentStyle={{
                      width: 280,
                      height: 190,
                      borderRadius: "5px",
                      boxShadow: "5px 5px 15px darkgrey",
                      borderWidth: 0
                    }}
                  >
                    <div className="d-flex flex-column align-content-center">
                      <label className="font-weight-bold m-3">
                        <span>
                          {props.t("submitOrder.orderValueDeclaration")}
                        </span>
                      </label>
                      <label className="ml-3 mr-3" style={{ fontSize: 13 }}>
                        {props.t("submitOrder.orderValueDeclarationText")}
                      </label>
                      <div className="d-flex justify-content-end mb-1">
                        <button
                          type="button"
                          className="btn btn-primary mt-1 mr-3"
                          onClick={() => setOpenOrderValueDeclaration(false)}
                        >
                          {props.t("submitOrder.gotIt")}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 50
                }}
              >
                <button
                  type="button"
                  className="btn"
                  style={{ 
                    color: "#050593", 
                    border: "1px solid #050593",
                    paddingLeft: 30,
                    paddingRight: 30

                  }}
                  onClick={context.handleBackButton}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={{ paddingLeft: 30, paddingRight: 30, background: "#050593"}}
                  className="btn btn-primary"
                  disabled={
                    isSubmitting ||
                    !isValid ||
                    !orderValueDeclaration ||
                    !shipmentReweighsPolicy
                  }
                >
                  {isSubmitting ? "Submiting..." : "Submit"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const mapState = ({ order, pickupPoint, shipperDetails }) => ({
  services: order.service,
  pickupPoints: pickupPoint.pickupPoints,
  shipperDetails: shipperDetails.shipperDetails
});

export default withNamespaces("common")(connect(mapState)(ServiceDefinitionSelection));
