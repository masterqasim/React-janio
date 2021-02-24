import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Formik, Form } from "formik";
import { withNamespaces } from "react-i18next";
import Select from "react-select";
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import * as yup from "yup";
import Popup from "reactjs-popup";
import PickupPointVisualize from "../../common/PickupPointVisualize";
import DialogAddPickupPoint from "./DialogAddPickupPoint";
import {CustomPopUp} from './customPopUp'
import { getPickupDataFromPickupPoint, getPickupDataFromService } from "../../../utils/createOrder";


const ServicesSelection = props => {
  const [shipmentReweighsPolicy, setShipmentReweighsPolicy] = useState(false);
  const [openReweighPolicy, setOpenReweighPolicy] = useState(false);

  const [orderValueDeclaration, setOrderValueDeclaration] = useState(false);
  const [openOrderValueDeclaration, setOpenOrderValueDeclaration] = useState(
    false
  );

  const [showAddPickupPointModal, setShowAddPickupPointModal] = useState(false);

  const context = useContext(OrderSubmitBulkContext);
  const getInitialValue = () => {
    const values = {};
    context.selectedServices.forEach((selectedService, index) => {
      const fieldName = `${selectedService.origin}-${selectedService.destination}`;
      values[fieldName] = {
        service: undefined,
        pickupPoint: undefined
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
        })
      });
    });
    const schema = yup.object().shape(objects);
    return schema;
  };

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
      {props.t("bulkSubmit.pickupPoints")}
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
                const service =
                  values[fieldName] && values[fieldName].service
                    ? values[fieldName].service.service
                    : null;
                const pickupPoint =
                  values[fieldName] && values[fieldName].pickupPoint
                    ? values[fieldName].pickupPoint.pickupPoint
                    : null;

                if (pickupPoint) {
                  pickupData = getPickupDataFromPickupPoint(pickupPoint);
                } else if (
                  service &&
                  service.service_category.includes("dropoff")
                ) {
                  pickupData = getPickupDataFromService(service);
                }

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
                      {pickupData && (
                        <PickupPointVisualize pickupData={pickupData} />
                      )}
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          {props.t("submitOrder.selectServicePlaceholder")}
                        </label>

                        <CustomPopUp 
                          message={'Choose a shipment service available for the country pairing.'} 
                          isOpen={false} 
                        />

                        <Select
                          placeholder={props.t("bulkSubmit.select")}
                          value={values[fieldName].service}
                          options={getServiceOptions(selectedService)}
                          onChange={v => {
                            setFieldValue(`${fieldName}.service`, v);
                          }}
                        />
                        {touched[fieldName] &&
                          errors[fieldName] &&
                          errors[fieldName].service && (
                            <div className="invalid-text">
                              {errors[fieldName].service}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      {values[fieldName] &&
                        values[fieldName].service &&
                        values[
                          fieldName
                        ].service.service.service_category.includes(
                          "pickup"
                        ) && (
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
                                    placeholder={props.t("bulkSubmit.select")}
                                    value={values[fieldName].pickupPoint}
                                    options={getPickupPointOptions(
                                      selectedService
                                    )}
                                    onChange={v => {
                                      setFieldValue(
                                        `${fieldName}.pickupPoint`,
                                        v
                                      );
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
                                  {props.t("bulkSubmit.addButton")}
                                </button>
                              </div>
                              {touched[fieldName] &&
                                errors[fieldName] &&
                                errors[fieldName].pickupPoint && (
                                  <div className="invalid-text">
                                    {errors[fieldName].pickupPoint}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              <hr />
              <div style={{ marginTop: 50}}>
                <h3 style={{fontSize: "1.1rem", fontWeight:"bold", paddingBottom: 20}}>{props.t("bulkSubmit.shipmentReweighPolicy")}</h3>
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
                <h3 style={{fontSize: "1.1rem", fontWeight:"bold", paddingBottom: 20}}>{props.t("bulkSubmit.valueDeclaration")}</h3>
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
                  {props.t("bulkSubmit.backButton")}
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
                  {isSubmitting ? "Submiting..." : props.t("bulkSubmit.submitButton")}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const mapState = ({ order, pickupPoint }) => ({
  services: order.service,
  pickupPoints: pickupPoint.pickupPoints
});

export default withNamespaces("common")(connect(mapState)(ServicesSelection));
