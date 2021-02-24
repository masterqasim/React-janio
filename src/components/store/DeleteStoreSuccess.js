import React, { Component } from "react";
import { connect } from "react-redux";

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

class DeleteStoreSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const title = "Delete Store Success!";

    const subTitleList = [
      ''
    ];

    const mainButtonList = [
      {
        link: '/web-stores/',
        text: 'View Web Stores'
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

export default connect(mapStateToProps, {})(DeleteStoreSuccess);
