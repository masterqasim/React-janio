import React, { useContext, useState } from "react";
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";

const AddPickupPointModal = ({ open, setOpen }) => {
  return (
    <Dialog
      onClose={() => setOpen(false)}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle>
        <p>Add a pickup point</p>
      </DialogTitle>
      <DialogContent>
        <div>
          <label>Name</label>
          <input type="text" />
        </div>
        <div>
          <h5>Pickup Point Location</h5>
          <div>
            <label>Country</label>
            <select></select>
            <label>State</label>
            <select></select>
            <label>City</label>
            <select></select>
            <label>Province</label>
            <input />
            <label>Address</label>
            <input />
            <label>Postal Code</label>
            <input />
          </div>
        </div>
        <div>
          <h5>Contact Information</h5>
          <label>Contact Person</label>
          <input />
          <label>Phone Number</label>
          <input />
          <label>Email</label>
          <input />
        </div>
      </DialogContent>
      <DialogActions>
        <button>Add a pickup point</button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPickupPointModal;
