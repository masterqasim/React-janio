import React, { useState, useEffect } from "react";
import { getCleanedRawObjects, getOrderObjects } from "./utils";
import { connect } from "react-redux";
import axios from "axios";
import { ROOT_URL } from "../../actions";
import { fetchService } from "../../actions/orderActions";
import { fetchPickupPoint } from "../../actions/pickupPointActions";
// import useStoreAddresses from "../shopifyOrders/hooks/useStoreAddresses";
import { formatError } from "./formatError";

const mapState = ({ shipperDetails }) => {
  return {
    shipperDetails: shipperDetails.shipperDetails
  };
};
const mapDispatch = {
  fetchService,
  fetchPickupPoint
};

export const OrderSubmitBulkContext = React.createContext();
export const OrderSubmitBulkContextProvider = connect(
  mapState,
  mapDispatch
)(props => {
  const secretKey =
    (props.shipperDetails &&
      props.shipperDetails.agent_application_secret_key) ||
    "";
  const [page, setPage] = useState(0);
  const [fileState, setFileState] = useState({
    filename: "",
    rawObjects: null,
    selected: false,
    triggerEffect: false
  });
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [errors, setErrors] = useState();
  const [orderObjects, setOrderObjects] = useState();
  // const pickupPoints = useStoreAddresses();

  useEffect(() => {
    if (secretKey) {
      props.fetchService(secretKey);
      props.fetchPickupPoint();
    }
  }, [secretKey]);

  const validateRawObjects = async () => {
    setLoading(true);
    const cleanedRawObjects = getCleanedRawObjects(fileState.rawObjects);
    const data = {
      secret_key: secretKey,
      orders: cleanedRawObjects
    };
    const url = `${ROOT_URL}/order/validate-csv/`;
    try {
      const response = await axios.post(url, data);
      setSelectedServices(response.data);
      setPage(1);
    } catch (err) {
      const response = err.data;
      setErrors(response.message);
      setSelectedServices([]);
      setPage(2);
    } finally {
      setLoading(false);
    }
  };

  const submitBulkOrder = async serviceValues => {
    setLoading(true);
    const cleanedRawObjects = getCleanedRawObjects(fileState.rawObjects);
    const orderObjects = getOrderObjects(cleanedRawObjects, serviceValues);
    setOrderObjects(orderObjects);

    const data = {
      secret_key: secretKey,
      orders: orderObjects
    };
    const url = `${ROOT_URL}/order/orders/`;
    try {
      const response = await axios.post(url, data);
      setPage(3);
      setFileState({
        filename: "",
        rawObjects: null,
        selected: false,
        triggerEffect: false
      });
    } catch (err) {
      const response = err.data;
      const errors = formatError(cleanedRawObjects, response);
      setErrors(errors);
      setSelectedServices([]);
      setPage(2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileState.triggerEffect) {
      validateRawObjects();
    }
  }, [fileState.triggerEffect]);

  const handleBackButton = () => {
    setPage(page - 1);
  };

  return (
    <OrderSubmitBulkContext.Provider
      value={{
        page,
        setPage,
        fileState,
        setFileState,
        validateRawObjects,
        submitBulkOrder,
        loading,
        errors,
        selectedServices,
        orderObjects,
        handleBackButton
      }}
    >
      {props.children}
    </OrderSubmitBulkContext.Provider>
  );
});
