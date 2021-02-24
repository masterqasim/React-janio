import React, { Component } from 'react';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { validate } from '../../utils/validatorUtils';
import { history } from '../../utils/historyUtils';

import {
  submitRegister,
  clearRegisterErrors
} from '../../actions/registerActions';

import InputField from '../common/InputField';

import img from '../../images/janio-main-logo.svg';

class Register extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      showDiffererentPasswordError: false,
      updatedStatus: false,
      email: '',
      password: '',
      passwordAgain: '',
      name: '',
      contactNumber: '',
      agentApplicationName: ''
    };
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    if (this.props.error === false) {
      history.push('/register/success');
    }

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.errorData !== this.state.errorData) {
      this.setState({
        errorData: this.props.errorData
      });
    }
  }

  renderField = (fieldName, name, type, id, placeholder, stateValue) => {
    return (
      <div className="form-group">
        <label className="h5 font-weight-bold">{fieldName}</label>
        <input
        name={name}
        type={type}
        className="form-control"
        id={id}
        placeholder={placeholder}
        value={stateValue}
        onChange={(e) => this.handleOnChange(e)}
        />
      </div>
    );
  }

  handleOnChange(e) {
    this.props.clearRegisterErrors();
    this.setState({
      showDiffererentPasswordError: false,
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      this.handleRegister();
    }
  }

  handleRegister = () => {
    this.props.clearRegisterErrors();
    this.setState({
      showDiffererentPasswordError: false
    });

    const validatorList = [
      { fieldName: 'email', optional: false, type: 'email' },
      { fieldName: 'password', optional: false, type: 'password' },
      { fieldName: 'passwordAgain', optional: false, type: 'password' },
      { fieldName: 'name', optional: false, type: 'text' },
      { fieldName: 'contactNumber', optional: false, type: 'text' },
      { fieldName: 'agentApplicationName', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      if (this.state.password === this.state.passwordAgain) {
        this.props.submitRegister(this.state.email, this.state.password, this.state.name, this.state.contactNumber, this.state.agentApplicationName);
        this.setState({
          updatedStatus: false
        });
      } else {
        this.setState({
          showDiffererentPasswordError: true
        });
      }
    }
  }

  render() {
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

          <div className="content-container card mt-4 mb-5 p-4">
            <InputField fieldName='email' i18nKey='register.email' placeholder='register.emailPlaceholder' name='email' type='email' stateValue={this.state.email} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='password' i18nKey='register.password' placeholder='register.passwordPlaceholder' name='password' type='password' stateValue={this.state.password} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='password again' i18nKey='register.passwordAgain' placeholder='register.passwordAgainPlaceholder' name='passwordAgain' type='password' stateValue={this.state.passwordAgain} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='name' i18nKey='register.name' placeholder='register.namePlaceholder' name='name' type='text' stateValue={this.state.name} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='contact number' i18nKey='register.contactNumber' placeholder='register.contactNumberPlaceholder' name='contactNumber' type='text' stateValue={this.state.contactNumber} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='agent application name' i18nKey='register.agentApplicationName' placeholder='register.agentApplicationNamePlaceholder' name='agentApplicationName' type='text' stateValue={this.state.agentApplicationName} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />

            {
              this.state.error === false ?
              <div className="alert alert-success" role="alert">
                <Trans i18nKey="register.registerSuccess" />
              </div>
              :
              null
            }

            {
              this.state.showDiffererentPasswordError ?
              <div className="alert alert-danger" role="alert">
                <Trans i18nKey="register.passwordAreNotSame" />
              </div>
              :
              null
            }

            {
              this.state.errorData ?
              <div className="alert alert-danger" role="alert">
                { this.state.errorData }
              </div>
              :
              null
            }

            <button
            type="button"
            className="w-100 btn btn-lg btn-success"
            onClick={this.handleRegister}
            disabled={this.state.updatedStatus ? false : true}>
            <Trans i18nKey="register.registerButton" />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({ register }) {
  return ({
    error: register.error,
    errorData: register.errorData
  });
}

export default compose(
  connect(mapStateToProps, {
    submitRegister,
    clearRegisterErrors
  }),
  withNamespaces('common')
)(Register);
