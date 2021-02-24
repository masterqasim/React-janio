import React, { useContext } from "react";
import { Alert } from "antd";
import { withNamespaces } from 'react-i18next';
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import ButtonSelectCSVExcel from "../../common/ButtonSelectCSVExcel";

const CSVSelection = props => {
  const context = useContext(OrderSubmitBulkContext);
  const excelTemplateLink =
    "https://res.cloudinary.com/janio/raw/upload/v1571986819/janio_bulk_order_submission_template.xlsx";
  const csvTemplateLink =
    "https://res.cloudinary.com/janio/raw/upload/v1571295225/janio-shipper-submit-order-CSV.csv";

  const handleResult = (jsonObjects, file) => {
    context.setFileState({
      rawObjects: jsonObjects,
      selected: true,
      filename: file.name
    });
  };

  return (
    <div>
      <div style={{ padding: "20px 0" }}>
        <p>{props.t("bulkSubmit.pleaseUploadCSV")}</p>
        {context.fileState.selected ? (
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ButtonSelectCSVExcel
                className="btn btn-primary"
                disabled={context.loading}
                text={`${context.fileState.filename}`}
                handleResult={handleResult}
              />
              <span style={{ padding: "0 20px" }}>{props.t("bulkSubmit.fileUploaded")}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => context.validateRawObjects()}
                className="btn btn-primary"
                style={{
                  background: "#050593",
                  paddingLeft: 30,
                  paddingRight: 30
                }}
                disabled={context.loading}
              >
                {context.loading ? props.t("bulkSubmit.validate") : props.t("bulkSubmit.nextButton")}
              </button>
            </div>
          </div>
        ) : (
          <ButtonSelectCSVExcel
            disabled={context.loading}
            text = {props.t("bulkSubmit.uploadButton")}
            handleResult={handleResult}
          />
        )}
      </div>
      <hr />
      <div style={{ padding: "20px 0" }}>
        <p>{props.t("bulkSubmit.downloadCSV")}</p>
        <a
          href={csvTemplateLink}
          className="btn"
          style={{ color: "#050593", border: "1px solid #050593" }}
        >
          {props.t("bulkSubmit.downloadCSVTemplate")}
        </a>
      </div>
      <hr />
      <div style={{ padding: "20px 0" }}>
        <p>
        {props.t("bulkSubmit.ordersToPhilMalThai")}
        </p>
        <a
          href={excelTemplateLink}
          className="btn"
          style={{ color: "#050593", border: "1px solid #050593" }}
        >
          {props.t("bulkSubmit.downloadExcelTemplate")}
        </a>
      </div>
    </div>
  );
};

export default withNamespaces("common")(CSVSelection);
