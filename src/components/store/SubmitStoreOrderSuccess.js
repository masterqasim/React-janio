import React, { Component } from "react";
import { connect } from "react-redux";
import { clearOrderErrors } from '../../actions/orderActions';

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class SubmitStoreOrderSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.props.clearOrderErrors();
  }

  render() {
    const title = "Store Order Submitted!";

    const subTitleList = [
      '',
      ''
    ];

    const secondaryButtonsList = [
      {
        link: '/view-web-store-orders/',
        text: 'View Web Store Orders'
      }
    ];

    const mainButtonList = [
      {
        link: '/view-orders/',
        text: 'View Delivery Orders'
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

export default connect(mapStateToProps, { clearOrderErrors })(SubmitStoreOrderSuccess);
