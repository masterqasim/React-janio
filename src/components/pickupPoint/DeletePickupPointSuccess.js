import React, { Component } from "react";
import { connect } from "react-redux";

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class DeletePickupPointSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const title = "Delete Pickup Point Success!";

    const subTitleList = [
      ''
    ];

    const mainButtonList = [
      {
        link: '/pickup-points/',
        text: 'View Pickup Points / Pickup Point'
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

export default connect(mapStateToProps, {})(DeletePickupPointSuccess);
