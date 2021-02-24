import React, { useContext, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces, Trans } from "react-i18next";
import { blue } from "@material-ui/core/colors";
import {
  OrderSubmitBulkContextProvider,
  OrderSubmitBulkContext
} from "./orderSubmitBulk.context";
import ServicesSelection from "./components/ServicesSelection";
import CSVSelection from "./components/CSVSelection";
import ErrorsPage from "./components/ErrorsPage";
import BulkOrderSuccess from "./components/BulkOrderSuccess";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import NavigationPrompt from "react-router-navigation-prompt";
import DialogLoading from "./components/DialogLoading";
import ExitsConfirmDialog from "./components/ExitsConfirmDialog";


const BlueRadio = withStyles({
  root: {
    color: blue[400],
    "&$checked": {
      color: blue[600]
    }
  },
  checked: {}
})(props => <Radio color="default" {...props} />);

const PageSelection = props => {
  const context = useContext(OrderSubmitBulkContext);
  const pages = [
    <CSVSelection />,
    <ServicesSelection />,
    <ErrorsPage />,
    <BulkOrderSuccess />
  ];
  const page = pages[context.page];

  return (
    <React.Fragment>
      <DialogLoading />
      <NavigationPrompt when={!!context.fileState.filename}>
        {({ onConfirm, onCancel }) => (
          <ExitsConfirmDialog onConfirm={onConfirm} onCancel={onCancel} />
        )}
      </NavigationPrompt>

      <div className="row">
        <div className="col-xs-12 col-md-10">{page}</div>
        <div className="col-xs-12 col-md-2">
          <FormControlLabel
            control={
              <BlueRadio
                checked={context.page < 1 ? true : false}
                disabled={context.page < 1 ? false : true}
              />
            }
            label={<Trans i18nKey='bulkSubmit.uploadButton' />}
            labelPlacement="end"
          />
          <div className="dotted-vr"></div>
          <FormControlLabel
            control={
              <BlueRadio
                checked={context.page >= 1 ? true : false}
                disabled={context.page >= 1 ? false : true}
              />
            }
            label={<Trans i18nKey='bulkSubmit.submitButton' />}
            labelPlacement="end"
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const OrderSubmitBulkPage = () => {
  return (
    <OrderSubmitBulkContextProvider>
      <PageSelection />
    </OrderSubmitBulkContextProvider>
  );
};

export default withNamespaces("common")(OrderSubmitBulkPage);
