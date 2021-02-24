import React, { Component } from "react";
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from '../../utils/historyUtils';
import {
  resetPassword,
  clearAuthErrors
} from '../../actions/authActions';

import img from '../../images/janio-main-logo-new.png';
import chineseImg from '../../images/janio-main-logo-chinese.png';
import {Alert, Button, Divider, Form} from "antd";
import backgroundImg from "../../images/janio-login-background.png";
import Input from "antd/es/input";
import i18n from 'i18next';

class ResetPassword extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      updatedStatus: false,
      emailAddress: undefined
    };
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    if (this.props.error === false) {
      history.push('/reset-password/success');
    }

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error,
        updatedStatus: false
      });
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleOnChange(e) {
    this.props.clearAuthErrors();
    this.setState({
      updatedStatus: false
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      if (this.state.emailAddress.length > 0) {
        this.handleSubmit(e);
      }
    }
  }

  handleSubmit = (e) => {
    this.props.clearAuthErrors();
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          updatedStatus: true
        })
        this.props.resetPassword(values.email);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
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
            {
              this.state.error === false ?
                  <Alert
                      className="mb-4"
                      message={<Trans i18nKey="resetPassword.resetPasswordSuccess" />}
                      type="success"
                  />
                  :
                  null
            }

            <div className="d-flex align-items-center justify-content-center">
              <h5 className='font-weight-bold' style={{letterSpacing: '1px'}}><Trans i18nKey='resetPassword.resetPassword'/></h5>
            </div>
            <Divider
                style={{marginTop: '5px', marginBottom: '15px'}}
            />
            <Form onChange={this.handleOnChange.bind(this)} onSubmit={this.handleSubmit} hideRequiredMark>
              <div>
                <h5 className='font-weight-bold'><Trans i18nKey='resetPassword.emailAddress'/></h5>
                <Form.Item>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: <Trans i18nKey='signin.wrongEmailInput'/>,
                      },
                      {
                        required: true,
                        message: <Trans i18nKey="signin.blankEmailInput"/>,
                      },
                    ],
                  })(<Input
                      name='emailAddress'
                      size='large'
                      onKeyUp={this.handleKeyUp.bind(this)}
                  />)}
                </Form.Item>
              </div>
            </Form>
            <div className="mb-3"/>
            {
              !this.state.updatedStatus ?
                  <Button
                      shape="round"
                      size="large"
                      style={this.state.emailAddress ? {
                        color: 'white',
                        backgroundColor: '#0DC9C5',
                        borderColor: '#0DC9C5',
                        height: '50px'
                      } : {color: '#0DC9C5', borderColor: '#0DC9C5', height: '50px'}}
                      type={this.state.emailAddress ? 'primary' : "ghost"}
                      onClick={this.handleSubmit}
                  >
                    <strong style={{fontSize: '17px'}}><Trans i18nKey="resetPassword.resetPasswordButton" /></strong>
                  </Button>
                  :
                  <Button
                      shape="round"
                      size="large"
                      style={{backgroundColor: '#0DC9C5', borderColor: '#0DC9C5', height: '50px', color: "white"}}
                      type='primary'
                      onClick={this.handleSubmit}
                      disabled
                  >
                    <Trans i18nKey="resetPassword.sendingEmail"/>
                  </Button>
            }

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

function mapStateToProps({ auth }) {
  return ({
    error: auth.error
  });
}

export default compose(
  connect(mapStateToProps, {
    resetPassword,
    clearAuthErrors
  }),
  withNamespaces('common')
)(Form.create({name:'sendResetPassword'})(ResetPassword));
