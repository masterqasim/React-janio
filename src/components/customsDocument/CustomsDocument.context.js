import React, { useState } from "react";
import axios from "axios";

export const CustomsDocumentContext = React.createContext();
export const CustomsDocumentContextProvider = props => {
  const [page, setPage] = useState("trackingNumber");



  const [trackingNo, setTrackingNo] = useState();
  const [customsDocuments, setCustomsDocuments] = useState();

  const submitCustomsDocument = async (recaptcha_response) => {
    const requestBody = {
      data: [{
        tracking_no: trackingNo,
        customs_document_requests: Object.keys(customsDocuments).map(type => ({
          ...customsDocuments[type]
        }))
      }],
      recaptcha_response
    };
    try {
      const response = await axios.post(
        "/api/attachments/fulfill-customs-document-requests/",
        requestBody
      );
      return response.data;
    } catch (error) {
      const response = {};
      response.isError = true;
      return response;
    }
  };

  return (
    <CustomsDocumentContext.Provider
      value={{
        page, setPage,
        customsDocuments, setCustomsDocuments,
        trackingNo, setTrackingNo,
        submitCustomsDocument,
      }}
    >
      {props.children}
    </CustomsDocumentContext.Provider>
  );
};
