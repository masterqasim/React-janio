import React, { useContext } from "react";
import { withNamespaces } from 'react-i18next';
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import ButtonSelectCSVExcel from "../../common/ButtonSelectCSVExcel";
import { formatErrorText } from "../utils";

const ErrorsPage = props => {
  const context = useContext(OrderSubmitBulkContext);
  const handleResult = (jsonObjects, file) => {
    context.setFileState({
      rawObjects: jsonObjects,
      selected: true,
      filename: file.name,
      triggerEffect: new Date().getUTCMilliseconds() // for triggering effect
    });
  };
  return (
    <div>
      <div style={{ padding: "20px 0" }}>
        <p style={{ fontSize: "18px", marginBottom: "25px", fontWeight: 700 }}>
          {props.t("bulkSubmit.fixErrors")}
        </p>
        <p>{props.t("bulkSubmit.uploadErrors")}</p>
        <p>
        {props.t("bulkSubmit.csvChanges")}
        </p>
        <p>{props.t("bulkSubmit.errorDocumentDownload")}</p>
      </div>
      <div style={{ display: "flex", marginBottom: 20 }}>
        <a
          href={`data:text/plain;charset=UTF-8;,${context.errors}`}
          download="errors.txt"
          className="btn"
          style={{ 
            margin: "0px 15px",
            color: "#050593", 
            border: "1px solid #050593",
          }}
        >
          {props.t("bulkSubmit.textDownload")}
        </a>
        <ButtonSelectCSVExcel
          disabled={context.loading}
          // text={context.loading ? "Validating..." : "Upload CSV/Excel"}
          text={context.loading ? props.t("bulkSubmit.validate")  : props.t("bulkSubmit.documentUpload")}

          handleResult={handleResult}
        />
      </div>
      <hr />
      <div style={{ padding: "20px 0" }}>
        {context.errors &&
          context.errors.map((err, index) => {
            const formattedError = formatErrorText(err);
            return (
              <p key={index}>
                {`${index + 1}) `}&nbsp;
                <span
                  dangerouslySetInnerHTML={{ __html: formattedError }}
                ></span>
              </p>
            );
          })}
      </div>
    </div>
  );
};

export default withNamespaces("common") (ErrorsPage);
