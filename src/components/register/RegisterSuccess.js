import React, { Component } from "react";
import { connect } from "react-redux";

import SubmitSuccessMessage from '../common/SubmitSuccessMessage';

import img from '../../images/janio-main-logo.svg';

class RegisterSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const title = "Welcome to Janio!";

    const subTitleList = [
      'Congratulations, your merchant account has been created.'
    ];

    const mainButtonList = [
      {
        link: '/signin/',
        text: 'Go to Signin Page'
      }
    ];

    return (
      <div className="d-flex flex-column align-items-center">
        <div className="top-container d-flex flex-column align-items-center bg-white w-100">
          <img
          src={img}
          className="logo-container img-fluid mb-3 mt-5 pt-5"
          alt=""
          />
        </div>

        <div className="d-flex flex-column align-items-center">

          <div className="divider mb-3" />

          <SubmitSuccessMessage
          title={title}
          subTitleList={subTitleList}
          mainButtonList={mainButtonList}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return ({

  });
}

export default connect(mapStateToProps, {})(RegisterSuccess);
