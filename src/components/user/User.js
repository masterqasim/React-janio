import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import _ from 'lodash';

import {
  fetchSignedInUser,
  editSignedInUser,
  changePassword,
  clearAuthErrors
} from '../../actions/authActions';
import { validate } from '../../utils/validatorUtils';

import InputField from '../common/InputField';

class User extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      editType: null,
      updatedStatus: false,
      email: '',
      name: '',
      isFirstMile: false,
      isShipper: false,

      changePasswordUpdatedStatus: false,
      diffPasswordStatus: false,
      currentPassword: '',
      newPassword: '',
      retypePassword: ''
    };
  }

  componentDidMount() {
    this.props.fetchSignedInUser();
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.email) {
      this.setState({
        email: this.props.user.email,
        name: this.props.user.name,
        isFirstMile: this.props.user.is_first_mile,
        isShipper: this.props.user.is_shipper
      })
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

    if (this.props.editType !== this.state.editType) {
      this.setState({
        editType: this.props.editType
      });
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  renderField = (fieldName, name, type, id, placeholder, stateValue) => {
    return (
      <div className="form-group">
        <label className="h5 font-weight-bold">{fieldName}</label>
        <input
          name={name}
          value={stateValue}
          onChange={(e) => this.handleOnChange(e)}
          type={type}
          className="form-control"
          id={id}
          placeholder={placeholder}
        />
      </div>
    );
  }

  renderCheckbox = (name, stateValue) => {
    return (
      <div className="form-check">
        <label className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            disabled={true}
            checked={stateValue}
            onChange={(e) => this.handleToggleCheckbox(e)} />
          {name}
        </label>
      </div>
    );
  }

  handleOnChange(e) {
    this.props.clearAuthErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handlePasswordOnChange(e) {
    this.props.clearAuthErrors();
    this.setState({
      changePasswordUpdatedStatus: true,
      diffPasswordStatus: false
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleToggleCheckbox = (e) => {
    this.props.clearAuthErrors();
    this.setState({
      updatedStatus: true
    });

    const { id } = e.target;
    this.setState({ [id]: !this.state[id] });
  }

  handleSubmit = () => {
    this.props.clearAuthErrors();

    const validatorList = [
      { fieldName: 'email', optional: false, type: 'email' },
      { fieldName: 'name', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      const { user } = this.props;
      const { name, email } = this.state;

      this.props.editSignedInUser(user.id, email, name);
      this.setState({
        updatedStatus: false
      });
    }
  }

  handleChangePassword = () => {
    this.props.clearAuthErrors();

    const validatorList = [
      { fieldName: 'currentPassword', optional: false, type: 'text' },
      { fieldName: 'newPassword', optional: false, type: 'text' },
      { fieldName: 'retypePassword', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (canSubmit) {
      const { user } = this.props;
      const { currentPassword, newPassword, retypePassword } = this.state;

      if (newPassword === retypePassword) {
        this.props.changePassword(user.id, currentPassword, newPassword);
        this.setState({
          changePasswordUpdatedStatus: false
        });
      } else {
        this.setState({
          diffPasswordStatus: true
        });
      }
    }
  }

  renderChangePasswordErrorAlert = () => {
    let errorDataDiv = null;

    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.error) {
      let errorMessage = [];
      _.forEach(this.state.errorData, (error) => {
        if (Object.keys(error).length > 0) {
          let fieldNames = Object.keys(error)
          for (const fieldName of fieldNames) {
            errorMessage.push(<p className="mb-1">{error[fieldName]}</p>)
          }
        }
      });

      errorDataDiv = <div className="alert alert-danger m-0" role="alert">
        <h5><b>Error</b></h5>
        {errorMessage}
      </div>;
    }

    return errorDataDiv;
  }

  render() {
    let renderDiv = null;
    if (this.props.user === undefined) {
      renderDiv = <div className="mt-5" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <ClipLoader
            color={'#273272'}
            loading={true}
          />
        </div>
      </div>;
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
        <Jumbotron className="p-4 border border-secondary">
          <InputField fieldName='email' i18nKey='users.email' placeholder='users.emailPlaceholder' name='email' type='email' stateValue={this.state.email} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='name' i18nKey='users.name' placeholder='users.namePlaceholder' name='name' type='text' stateValue={this.state.name} onChange={this.handleOnChange.bind(this)} />
          {/*this.renderCheckbox('isFirstMile', this.state.isFirstMile)*/}
          {/*this.renderCheckbox('isShipper', this.state.isShipper)*/}

          {
            this.state.editType === 'user' && this.props.error === false ?
              <div className="alert alert-success mt-2 mb-0" role="alert">
                <Trans i18nKey="users.updateUserSuccess" />
              </div>
              :
              null
          }

          {
            this.props.editType === 'user' && !_.isEmpty(this.state.errorData) ?
              <div className="alert alert-danger m-0" role="alert">
                <h5><b><Trans i18nKey="orders.error" /></b></h5>
                {JSON.stringify(this.state.errorData)}
              </div>
              :
              null
          }

          <button
            type="button"
            className="mt-3 w-100 btn btn-lg btn-success"
            onClick={this.handleSubmit}
            disabled={this.state.updatedStatus ? false : true}>
            <Trans i18nKey="users.submit" />
          </button>
        </Jumbotron>

        <Jumbotron className="p-4 border border-secondary">
          <InputField fieldName='current password' i18nKey='changePassword.currentPassword' placeholder='changePassword.currentPasswordPlaceholder' name='currentPassword' type='password' stateValue={this.state.currentPassword} onChange={this.handlePasswordOnChange.bind(this)} />
          <InputField fieldName='new password' i18nKey='changePassword.newPassword' placeholder='changePassword.newPasswordPlaceholder' name='newPassword' type='password' stateValue={this.state.newPassword} onChange={this.handlePasswordOnChange.bind(this)} />
          <InputField fieldName='retype password' i18nKey='changePassword.retypePassword' placeholder='changePassword.retypePasswordPlaceholder' name='retypePassword' type='password' stateValue={this.state.retypePassword} onChange={this.handlePasswordOnChange.bind(this)} />

          {
            this.state.editType === 'changePassword' && this.props.error === false ?
              <div className="alert alert-success mt-2 mb-0" role="alert">
                <Trans i18nKey="changePassword.changePasswordSuccess" />
              </div>
              :
              null
          }

          {
            this.state.diffPasswordStatus ?
              <div className="alert alert-danger mt-2 mb-0" role="alert">
                <Trans i18nKey="changePassword.passwordAreNotSame" />
              </div>
              :
              null
          }

          {
            this.props.editType === 'changePassword' && !_.isEmpty(this.state.errorData) ?
              this.renderChangePasswordErrorAlert()
              :
              null
          }

          <button
            type="button"
            className="mt-3 w-100 btn btn-lg btn-success"
            onClick={this.handleChangePassword}
            disabled={!this.state.changePasswordUpdatedStatus}>
            <Trans i18nKey="changePassword.changePasswordButton" />
          </button>
        </Jumbotron>
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return ({
    error: auth.error,
    errorData: auth.errorData,
    user: auth.user,
    editType: auth.editType
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchSignedInUser,
    editSignedInUser,
    changePassword,
    clearAuthErrors
  }),
  withNamespaces('common')
)(User);
