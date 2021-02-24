import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { validate } from '../../utils/validatorUtils';
import _ from 'lodash';

import {
  fetchAllCountries
} from '../../actions/orderActions';
import {
  registerAccount,
  clearRegisterErrors
} from '../../actions/registerActions';

import InputField from '../common/InputField';
import DropdownField from '../common/DropdownField';

import img from '../../images/janio-main-logo.svg';

class RegisterShopify extends Component {
  constructor() {
    super();

    const url = new URL(window.location.href);
    const shop = url.searchParams.get("shop");
    
    this.state = {
      error: true,
      errorData: null,
      showDiffererentPasswordError: false,
      showWhereAreYouShippingFromError: false,
      updatedStatus: false,

      email: '',
      password: '',
      passwordAgain: '',
      consigneeCountry: '',
      shop: shop
    };
  }

  componentDidMount() {
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentDidUpdate() {
    if (this.props.error === false) {
      window.location.href = this.props.permissionUrl;
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

  renderCountries = () => {
    let options = [{
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.props.countries, (item, i) => {
      let data = {
        value: item,
        label: item
      };
      options.push(data);
    });

    return options;
  }

  handleOnChange(e) {
    this.props.clearRegisterErrors();
    this.setState({
      showDiffererentPasswordError: false,
      showWhereAreYouShippingFromError: false,
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleCountryChange = (e) => {
    this.props.clearRegisterErrors();
    this.setState({
      showDiffererentPasswordError: false,
      showWhereAreYouShippingFromError: false,
      updatedStatus: true
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select one...') {
      this.setState({
        consigneeCountry: selectedValue
      });
    } else {
      this.setState({
        consigneeCountry: ''
      });
    }
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
      { fieldName: 'consigneeCountry', optional: false, type: 'text' }
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      if (this.state.password === this.state.passwordAgain) {
        if (this.state.consigneeCountry) {
          this.props.registerAccount(this.state.email, this.state.password, this.state.shop);
          this.setState({
            updatedStatus: false
          });
        } else {
          this.setState({
            showWhereAreYouShippingFromError: true
          });
        }
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
          {!this.state.shop ? <h1>No shop param</h1>:
          <div className="content-container card mt-4 mb-5 p-4">
            <InputField fieldName='email' i18nKey='register.email' placeholder='register.emailPlaceholder' name='email' type='email' stateValue={this.state.email} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='password' i18nKey='register.password' placeholder='register.passwordPlaceholder' name='password' type='password' stateValue={this.state.password} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='password again' i18nKey='register.passwordAgain' placeholder='register.passwordAgainPlaceholder' name='passwordAgain' type='password' stateValue={this.state.passwordAgain} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            {/* <DropdownField fieldName='consignee country' i18nKey='register.whereAreYouShippingFrom' placeholder='select one...' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleCountryChange(e)} renderItems={this.renderCountries()} /> */}

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
              this.state.showWhereAreYouShippingFromError ?
                <div className="alert alert-danger" role="alert">
                  <Trans i18nKey="register.whereAreYouShippingFromError" />
                </div>
                :
                null
            }

            {
              this.state.errorData ?
                <div className="alert alert-danger" role="alert">
                  {JSON.stringify(this.state.errorData)}
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

            <LinkContainer to={`/signin-shopify?shop=${this.state.shop}`}
              className="mt-2 d-flex justify-content-end pointer">
              <div className="h5"><Trans i18nKey="register.signin" /></div>
            </LinkContainer>
          </div>
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps({ register, order }) {
  return ({
    error: register.error,
    errorData: register.errorData,
    countries: order.countries,
    permissionUrl: register.permissionUrl
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchAllCountries,
    registerAccount,
    clearRegisterErrors
  }),
  withNamespaces('common')
)(RegisterShopify);
