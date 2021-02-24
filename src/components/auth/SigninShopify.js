import React, { Component } from "react";
import queryString from 'query-string'
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

import img from '../../images/janio-main-logo-new.png';
import chineseImg from '../../images/janio-main-logo-chinese.png';
import {Alert, Button, Divider, Form} from "antd";
import Input from "antd/es/input";
import backgroundImg from "../../images/janio-login-background.png";

class Signin extends Component {
  constructor(props) {
    super(props);

    const queries = queryString.parse(window.location.search)
    const orderIds = queries['ids[]'] || queries.ids || queries.id
    const ids = orderIds instanceof Array ? orderIds.join():orderIds

    this.state = {
      error: false,
      clicked: false,

      username: '',
      password: '',
      queries,
      ids
    };
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
        this.props.signinUser(
          values.email,
          values.password,
          history,
          window.location.search
        );
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { shop, hmac, timestamp } = this.state.queries
    
    return (
        <div className="d-flex flex-column align-items-center vh-100" style={{backgroundColor: '#F4FDFC', overflow: 'auto'}}>
          <div className="d-flex flex-column align-items-center w-100 mb-2">
            <img
            src={i18n.language.includes('ch') ? chineseImg : img}
            className="logo-container img-fluid mb-4 mt-4 pt-4"
            alt=""
            />
          </div>

          <div className="d-flex flex-column align-items-center">
            {(!shop || !timestamp || !hmac || !this.state.ids) ? <h1>Invalid signin parameters</h1> :
            <div className="content-container card mt-4 mb-5 p-5" style={{zIndex: '1'}}>
              {
                this.state.error ?
                    <Alert
                        className="mb-4"
                        message={<Trans i18nKey='signin.wrongUsernameOrPasswordCombination' />}
                        type="error"
                    />
                    :
                    null
              }

              <div className="d-flex align-items-center justify-content-center">
                <h5 className='font-weight-bold' style={{letterSpacing: '1px'}}><Trans i18nKey='signin.shopifyLogin'/></h5>
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
                      <strong style={{fontSize: '20px'}}><Trans i18nKey='signin.connectShopify'/></strong>
                    </Button>
                    :
                    <Button
                        shape="round"
                        size="large"
                        style={{backgroundColor: '#0DC9C5', borderColor: '#0DC9C5', height: '50px', color: "white"}}
                        type='primary'
                        onClick={this.handleLogin}
                        disabled
                    >
                      <strong style={{fontSize: '20px'}}><Trans i18nKey='signin.conncetingShopify'/></strong>
                    </Button>
              }
            </div>
            }
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
    error: auth.error
  });
}

export default compose(
  connect(mapStateToProps, {
    signinUser,
    clearAuthErrors
  }),
  withNamespaces('common')
)(Form.create({name:'shopifyLoginForm'})(Signin));
