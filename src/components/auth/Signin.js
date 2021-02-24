import React, { Component } from "react";
import { connect } from "react-redux";
import { LinkContainer } from 'react-router-bootstrap';
import { history } from "../../utils/historyUtils";
import compose from 'recompose/compose';
import i18n from 'i18next';
import { withNamespaces, Trans } from 'react-i18next';

import {
  signinUser,
  clearAuthErrors
} from "../../actions/authActions";

import { Form, Button, Divider, Alert, Input } from 'antd';

import img from '../../images/janio-main-logo-new.png';
import chineseImg from '../../images/janio-main-logo-chinese.png';
import backgroundImg from '../../images/janio-login-background.png'

class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      clicked: false,

      username: undefined,
      password: undefined,
    };
  }

  componentDidMount() {
    // i18n.changeLanguage('cht')
  }

  componentDidUpdate() {
    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error,
        clicked: false
      });
    }
  }

  handleOnChange(e) {
    this.props.clearAuthErrors();
    this.setState({
      clicked: false
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      if (this.state.username.length > 0 && this.state.password.length > 0) {
        this.handleLogin();
      }
    }
  }

  handleLogin = (e) => {
    this.props.clearAuthErrors();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({
          clicked: true
        })
        this.props.signinUser(values.email, values.password, history);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <div className="d-flex flex-column align-items-center vh-100" style={{backgroundColor: '#F4FDFC', overflow: 'auto'}}>
          <div className="d-flex flex-column align-items-center w-100 mb-2">
            <img
                src={i18n.language.includes('ch') ? chineseImg : img}
                className="logo-container img-fluid mb-2 mt-4 pt-4"
                alt=""
            />
          </div>

          <div className="d-flex flex-column align-items-center">
            <div className="content-container card mt-4 mb-5 p-5" style={{zIndex: '1'}}>
              {
                this.state.error ?
                    <Alert
                        className="mb-4"
                        message={<Trans i18nKey='signin.wrongUsernameOrPasswordCombination'/>}
                        type="error"
                    />
                    :
                    null
              }

              <div className="d-flex align-items-center justify-content-center">
                <h5 className='font-weight-bold' style={{letterSpacing: '1px'}}><Trans i18nKey="signin.merchantLogin"/></h5>
              </div>
              <Divider
                  style={{marginTop: '5px', marginBottom: '15px'}}
              />
              <Form onChange={this.handleOnChange.bind(this)} onSubmit={this.handleLogin} hideRequiredMark>
                <div>
                  <h5 className='font-weight-bold'><Trans i18nKey='signin.emailAddress'/></h5>
                  <Form.Item>
                    {getFieldDecorator('email', {
                      rules: [
                        {
                          type: 'email',
                          message: <Trans i18nKey="signin.wrongEmailInput"/>,
                        },
                        {
                          required: true,
                          message: <Trans i18nKey="signin.blankEmailInput"/>,
                        },
                      ],
                    })(<Input
                          name='username'
                          size='large'
                          onKeyUp={this.handleKeyUp.bind(this)}
                    />)}
                  </Form.Item>
                </div>
                <div className='mt-3'>
                  <h5 className='font-weight-bold'><Trans i18nKey='signin.password'/></h5>
                  <Form.Item
                      hasFeedback
                  >
                    {getFieldDecorator('password', {
                      rules: [{
                        required: true, message: <Trans i18nKey="signin.blankPasswordInput"/>,
                      }]
                    })
                    (
                        <Input
                            name='password'
                            type="password"
                            size='large'
                            onKeyUp={this.handleKeyUp.bind(this)}
                        />
                    )}
                  </Form.Item>
                </div>
              </Form>

              <LinkContainer to="/reset-password" className="mt-1 mb-4 d-flex justify-content-end pointer">
                <div><h6 style={{color: 'grey'}}><Trans i18nKey="signin.forgetPassword"/></h6></div>
              </LinkContainer>

              {
                !this.state.clicked ?
                    <Button
                        shape="round"
                        size="large"
                        style={this.state.username && this.state.password ? {
                          backgroundColor: '#0DC9C5',
                          borderColor: '#0DC9C5',
                          height: '50px'
                        } : {color: '#0DC9C5', borderColor: '#0DC9C5', height: '50px'}}
                        type={this.state.username && this.state.password ? 'primary' : "ghost"}
                        onClick={this.handleLogin}
                    >
                      <strong style={{fontSize: '20px'}}><Trans i18nKey="signin.loginAsMerchant"/></strong>
                    </Button>
                    // <button
                    // type="button"
                    // className="mt-2 w-100 text-white btn btn-lg btn-janio"
                    // onClick={this.handleLogin}>
                    // <Trans i18nKey="signin.loginAsMerchant" />
                    // </button>
                    :
                    <Button
                        shape="round"
                        size="large"
                        style={{backgroundColor: '#0DC9C5', borderColor: '#0DC9C5', height: '50px', color: "white"}}
                        type='primary'
                        onClick={this.handleLogin}
                        disabled
                    >
                      <Trans i18nKey="signin.loggingIn"/>
                    </Button>
              }

              {/*<LinkContainer to="/register" className="mt-1">
              <div className="w-100 text-white btn btn-lg btn-janio">Register</div>
            </LinkContainer>*/}
            </div>
          </div>

          <div className='login-image w-100'>
            <img
                style={{height: '100%', width: '100%', backgroundSize: 'cover'}}
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
    error: auth.error
  });
}

export default compose(
  connect(mapStateToProps, {
    signinUser,
    clearAuthErrors
  }),
  withNamespaces('common')
)(Form.create({name:'loginForm'})(Signin));
