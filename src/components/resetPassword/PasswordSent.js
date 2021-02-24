import React, { Component } from "react";
import { connect } from "react-redux";

import {passwordSent, signoutUser} from '../../actions/authActions';

import img from '../../images/janio-main-logo-new.png';
import chineseImg from '../../images/janio-main-logo-chinese.png';
import _ from "lodash";
import { history } from '../../utils/historyUtils';
import backgroundImg from "../../images/janio-login-background.png";
import {Alert, Button, Divider, Form} from "antd";
import i18n from 'i18next';
import {Trans, withNamespaces} from "react-i18next";
import Input from "antd/es/input";
import compose from "recompose/compose";

class PasswordSent extends Component {
  constructor() {
    super();
    this.state = {
      newPassword: '',
      newPasswordConfirm: '',
      error: false,
      success: false,
      errorData: '',
    };
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    if (this.props.resetPasswordError === false){
      this.props.signoutUser(history)
    }
  }

  componentWillUnmount() {

  }

  handleOnChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      if (this.state.newPassword.length > 0 && this.state.newPasswordConfirm.length > 0) {
        this.handleResetPassword(e);
      }
    }
  }

  handleResetPassword = (e) => {
    e.preventDefault()
    let {newPassword, newPasswordConfirm} = this.state
    if (newPassword !== newPasswordConfirm) {
      this.setState({
        error:true,
        errorData: <Trans i18nKey='passwordSent.passwordMatchError'/>
      })
    } else if (newPassword.length < 8) {
      this.setState({
        error:true,
        errorData: <Trans i18nKey='passwordSent.passwordLengthError'/>
      })
    } else {
      this.setState({
        error:false,
        errorData: '',
        success:true
      })
      const resetToken = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

      if (resetToken !== null) {
        this.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            this.props.passwordSent(values.newPassword, resetToken);
          }
        });
      }
    }
  }

  renderAlerts = () => {
    let errorDataDiv = null;
    let successDataDiv= null;

    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.error) {
      errorDataDiv =
          <Alert
              className="mb-4"
              message={this.state.errorData}
              type="error"
          />

      return errorDataDiv;
    }

    if (this.state.success) {
      successDataDiv =
          <Alert
              className="mb-4"
              message={<Trans i18nKey='passwordSent.passwordChanged'/>}
              type="success"
          />

      return successDataDiv;
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
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
            {this.renderAlerts()}
            <div className="d-flex align-items-center justify-content-center">
              <h5 className='font-weight-bold' style={{letterSpacing: '1px'}}><Trans i18nKey='resetPassword.resetPassword'/></h5>
            </div>
            <Divider
                style={{marginTop: '5px', marginBottom: '15px'}}
            />
            <Form onChange={this.handleOnChange.bind(this)} onSubmit={this.handleResetPassword} hideRequiredMark>
              <div className='mt-3'>
                <h5 className='font-weight-bold'><Trans i18nKey='passwordSent.newPassword'/></h5>
                <Form.Item
                    hasFeedback
                >
                  {getFieldDecorator('newPassword', {
                    rules: [{
                      required: true, message: <Trans i18nKey='passwordSent.newPasswordBlankError'/>,
                    }]
                  })
                  (
                      <Input
                          name='newPassword'
                          type="password"
                          size='large'
                          onKeyUp={this.handleKeyUp.bind(this)}
                      />
                  )}
                </Form.Item>
              </div>
              <div className='mt-4 mb-4'>
                <h5 className='font-weight-bold'><Trans i18nKey='passwordSent.confirmNewPassword'/></h5>
                <Form.Item
                    hasFeedback
                >
                  {getFieldDecorator('newPasswordConfirm', {
                    rules: [{
                      required: true, message: <Trans i18nKey='passwordSent.confirmNewPasswordBlankError'/>,
                    }]
                  })
                  (
                      <Input
                          name='newPasswordConfirm'
                          type="password"
                          size='large'
                          onKeyUp={this.handleKeyUp.bind(this)}
                      />
                  )}
                </Form.Item>
              </div>
            </Form>
            <Button
                shape="round"
                size="large"
                style={this.state.newPassword && this.state.newPasswordConfirm ? {
                  color: 'white',
                  backgroundColor: '#0DC9C5',
                  borderColor: '#0DC9C5',
                  height: '50px'
                } : {color: '#0DC9C5', borderColor: '#0DC9C5', height: '50px'}}
                type={this.state.newPassword && this.state.newPasswordConfirm ? 'primary' : "ghost"}
                onClick={this.handleResetPassword}
            >
              <strong style={{fontSize: '17px'}}><Trans i18nKey='passwordSent.setPassword'/></strong>
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

function mapStateToProps({auth}) {
  return ({
    resetPasswordError: auth.error
  });
}

export default compose(
    connect(mapStateToProps, {
      signoutUser,
      passwordSent
    }),
    withNamespaces('common')
)(Form.create({name:'resetPassword'})(PasswordSent));
