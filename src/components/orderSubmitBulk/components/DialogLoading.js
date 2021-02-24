import React, { useContext } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { FadeLoader } from "react-spinners";
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";

const DialogContentLoading = () => (
  <DialogContent style={{ padding: 32, width: 320 }}>
    <p>Uploading in progress, please wait...</p>
    <p>
      This may take up to a few minutes if there are a large number of orders.
    </p>
    <div className="flex-center mt-4">
      <FadeLoader />
    </div>
  </DialogContent>
);

const DialogLoading = props => {
  const context = useContext(OrderSubmitBulkContext);
  return (
    <Dialog open={context.loading}>
      <DialogContentLoading />
    </Dialog>
  );
};

export default DialogLoading;
