import React from "react";
import { connect } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddPickupPoint from "../../pickupPoint/AddPickupPoint";
import { fetchPickupPoint } from "../../../actions/pickupPointActions";

const DialogAddPickupPoint = props => {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth={true}>
      <DialogTitle>Add a pickup point</DialogTitle>
      <DialogContent>
        <AddPickupPoint
          onSuccess={() => {
            if (props.open) {
              props.onClose();
              props.fetchPickupPoint();
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const mapState = () => ({});

const mapDispatch = {
  fetchPickupPoint
};

export default connect(
  mapState,
  mapDispatch
)(DialogAddPickupPoint);
