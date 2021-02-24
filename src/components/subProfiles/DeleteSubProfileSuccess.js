import React, { Component } from "react";
import { connect } from "react-redux";

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class DeleteSubProfileSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const title = "Sub Profile Deleted!";

    const subTitleList = [
      ''
    ];

    const mainButtonList = [
      {
        link: '/sub-profiles/',
        text: 'View all sub profiles'
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

export default connect(mapStateToProps, {})(DeleteSubProfileSuccess);
