import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import {
  fetchSignedInUser,
  changePassword,
  clearAuthErrors
} from '../../actions/authActions';
import { validate } from '../../utils/validatorUtils';

import InputField from '../common/InputField';

class ChangePassword extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      updatedStatus: false,
      diffPasswordStatus: false,
      newPassword: '',
      retypePassword: ''
    };
  }

  componentDidMount() {
    this.props.fetchSignedInUser();
  }

  componentDidUpdate() {
    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
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
        onKeyUp={(e) => this.handleKeyUp(e)}
        type={type}
        className="form-control"
        id={id}
        placeholder={placeholder}
        />
      </div>
    );
  }

  handleOnChange(e) {
    this.props.clearAuthErrors();
    this.setState({
      updatedStatus: true,
      diffPasswordStatus: false
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      if (this.state.newPassword.length > 0 && this.state.retypePassword.length > 0) {
        this.handleSubmit();
      }
    }
  }

  handleSubmit = () => {
    this.props.clearAuthErrors();

    const validatorList = [
      { fieldName: 'newPassword', optional: false, type: 'text' },
      { fieldName: 'retypePassword', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (canSubmit) {
      const { user } = this.props;
      const { newPassword, retypePassword } = this.state;

      if (newPassword === retypePassword) {
        this.props.changePassword(user.id, newPassword);
        this.setState({
          updatedStatus: false
        });
      } else {
        this.setState({
          diffPasswordStatus: true
        });
      }
    }
  }

  render() {
    return (
      <div>
        <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px'}}>
          <Jumbotron className="p-4 border border-secondary">
            <InputField fieldName='new password' i18nKey='changePassword.newPassword' placeholder='changePassword.newPasswordPlaceholder' name='newPassword' type='password' stateValue={this.state.newPassword} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
            <InputField fieldName='retype password' i18nKey='changePassword.retypePassword' placeholder='changePassword.retypePasswordPlaceholder' name='retypePassword' type='password' stateValue={this.state.retypePassword} onChange={this.handleOnChange.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />

            {
              this.state.error === false ?
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

            <button
            type="button"
            className="mt-3 w-100 btn btn-lg btn-success"
            onClick={this.handleSubmit}
            disabled={this.state.updatedStatus ? false : true}>
            <Trans i18nKey="changePassword.changePasswordButton" />
            </button>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return ({
    user: auth.user,
    error: auth.error
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchSignedInUser,
    changePassword,
    clearAuthErrors
  }),
  withNamespaces('common')
)(ChangePassword);
