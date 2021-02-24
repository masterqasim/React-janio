import React, { useContext } from "react";
import { Layout } from "antd";
import {
  CustomsDocumentContext,
  CustomsDocumentContextProvider
} from "./CustomsDocument.context";
import EnterTrackingNumber from "./components/EnterTrackingNumber";
import UploadDocuments from "./components/UploadDocuments";
import UploadSuccess from "./components/UploadSuccess";


const LOGO_URL =
  "https://res.cloudinary.com/janio/image/upload/v1558396932/janio-no_tagline.png";

const PageSelection = () => {
  const pages = {
    trackingNumber: <EnterTrackingNumber />,
    uploadDocuments: <UploadDocuments />,
    success: <UploadSuccess />
  };
  const context = useContext(CustomsDocumentContext);
  return (
    <Layout style={{ minHeight: '100%' }}>
      {context.page !== 'trackingNumber' && (
        <Layout.Header>
          <img src={LOGO_URL} alt="" style={{ cursor: 'pointer' }} onClick={() => {window.location.reload()}} />
        </Layout.Header>
      )}

      {pages[context.page]}

      {context.page !== 'trackingNumber' && (
        <Layout.Footer>
          <p>Need help? Contact us at <a href="mailto:support@janio.asia">support@janio.asia</a></p>
        </Layout.Footer>
      )}
    </Layout>
  )
};

const CustomsDocumentPage = () => {
  return (
    <CustomsDocumentContextProvider>
      <div className="customs-document-container">
        <PageSelection />
      </div>
    </CustomsDocumentContextProvider>
  );
};

export default CustomsDocumentPage;
