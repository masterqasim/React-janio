import React, { Component } from "react";
import { connect } from "react-redux";

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class AddPickupPointSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const title = "Pickup Point Added!";

    const subTitleList = [
      'You may select the new pickup point when submitting orders now.'
    ];

    const mainButtonList = [
      {
        link: '/pickup-points/',
        text: 'View Pickup Points / Pickup'
      }
    ];

    return (
      <div>
        <SubmitSuccessMessage
        title={title}
        subTitleList={subTitleList}
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

export default connect(mapStateToProps, {})(AddPickupPointSuccess);
