import React, { useContext } from "react";
import { OrderSubmitBulkContext } from "../orderSubmitBulk.context";
import { LinkContainer } from "react-router-bootstrap";

const BulkOrderSuccess = props => {
  const context = useContext(OrderSubmitBulkContext);
  return (
    <div>
      <h6 style={{ fontWeight: 700, margin: "30px 0px" }}>
        Bulk Order Submission Completed
      </h6>
      <div>
        <p className="mb-2">
          You have successfully submitted a total of {props.totalOrders} orders.
        </p>
        <p className="mb-2">
          We are currently processing your orders and will email you any updates
          of your order status shortly.
        </p>
        <p className="mb-2">
          Orders submitted before 1pm will be picked up between 2pm-6pm on the
          same day.
        </p>
        <p className="mb-2">
          Kindly paste the barcode label and commercial invoice on the packaging
          before pickup.
        </p>
        <p className="mb-2">
          You may view your submitted orders in{" "}
          <a href="/view-orders">Manage Orders.</a>
        </p>
      </div>
      <div style={{ margin: "30px 0" }}>
        <a
          href="#"
          onClick={() => context.setPage(0)}
          className="btn btn-outline-primary"
        >
          Back to Submit Bulk Orders
        </a>
      </div>
    </div>
  );
};

export default BulkOrderSuccess;
