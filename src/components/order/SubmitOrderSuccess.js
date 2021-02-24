import React, { Component } from "react";
import { connect } from "react-redux";
import { clearOrderErrors } from '../../actions/orderActions';

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class SubmitOrderSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.props.clearOrderErrors();
  }

  render() {
    const title = "Order Submitted!";

    const subTitleList = [
      'Orders submitted before 1pm will be picked up between 2pm-6pm on the same day.',
      'Kindly paste the barcode label and commercial invoice on the packaging before pickup.'
    ];

    const secondaryButtonsList = [
      {
        link: '/submit-order/',
        text: 'Submit Another by Form'
      },
      {
        link: '/submit-order-csv/',
        text: 'Submit Another by CSV / Excel'
      }
    ];

    const mainButtonList = [
      {
        link: '/view-orders/',
        text: 'Manage Orders'
      }
    ];

    return (
      <div>
        <SubmitSuccessMessage
          title={title}
          subTitleList={subTitleList}
          secondaryButtonsList={secondaryButtonsList}
          mainButtonList={mainButtonList}
        />
      </div>
    );
  }
}

function mapStateToProps() {
  return ({

  });
}

export default connect(mapStateToProps, { clearOrderErrors })(SubmitOrderSuccess);
