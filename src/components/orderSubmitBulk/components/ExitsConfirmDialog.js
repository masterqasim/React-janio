import React from "react";
import { withNamespaces } from 'react-i18next';
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";

const ExitsConfirmDialog = props => {
  return (
    <Dialog open={true}>
      <DialogTitle>
      {props.t("bulkSubmit.leaveBulkOrderSubmission")}
      </DialogTitle>
      <DialogContent>
        <p>{props.t("bulkSubmit.changesNotSaved")}</p>
      </DialogContent>
      <DialogActions>
        <button
          className="btn btn-outline-primary"
          onClick={props.onCancel}
          color="primary"
        >
          {props.t("bulkSubmit.noButton")}
        </button>
        <button onClick={props.onConfirm} className="btn btn-primary">
        {props.t("bulkSubmit.yesButton")}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default withNamespaces("common") (ExitsConfirmDialog);
