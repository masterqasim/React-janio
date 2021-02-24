import React, { Component } from "react";
import { connect } from "react-redux";

import img from '../../images/janio-main-logo-new.png';
import chineseImg from '../../images/janio-main-logo-chinese.png';
import backgroundImg from "../../images/janio-login-background.png";
import i18n from 'i18next';
import { withNamespaces, Trans} from "react-i18next";
import {Button} from "antd";
import {signoutUser} from "../../actions/authActions";
import {history} from "../../utils/historyUtils";
import compose from 'recompose/compose';

class ResetPasswordSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

    render() {

    return (
    <div className="d-flex flex-column align-items-center vh-100" style={{backgroundColor: '#F4FDFC', overflow: 'auto'}}>
        <div className="d-flex flex-column align-items-center w-100">
          <img
          src={i18n.language.includes('ch') ? chineseImg : img}
          className="logo-container img-fluid mb-3 mt-4 pt-4"
          alt=""
          />
        </div>

        <div className="d-flex flex-column align-items-center">
          <div className="content-container card mt-4 mb-5 p-5" style={{zIndex: '1'}}>
            <div className="h2 text-center mb-4"><Trans i18nKey='resetPassword.emailSent'/></div>
            <div className="h5 text-center mb-4"><Trans i18nKey='resetPassword.checkEmail'/></div>
            <Button
                shape="round"
                size="default"
                style={{
                  color: 'white',
                  backgroundColor: '#0DC9C5',
                  borderColor: '#0DC9C5',
                  height: '50px'
                }}
                type="primary"
                onClick={() => {this.props.signoutUser(history)}}
            >
              <strong style={{fontSize: '17px'}}><Trans i18nKey='resetPassword.signInButton'/></strong>
            </Button>
          </div>
        </div>
        <div className='login-image w-100'>
          <img
              style={{height: '100%', width: '100%', objectFit: 'contain'}}
              src={backgroundImg}
              alt=''
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

export default compose(
    connect(mapStateToProps, {
        signoutUser
    }),
    withNamespaces('common')
)(ResetPasswordSuccess);
