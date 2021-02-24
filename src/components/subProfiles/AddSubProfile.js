import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import { history } from '../../utils/historyUtils';
import { validate } from '../../utils/validatorUtils';
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  addSubProfile,
  clearSubProfilesErrors
} from '../../actions/subProfilesActions';

import InputField from '../common/InputField';
import DropdownField from '../common/DropdownField';

class AddSubProfile extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      updatedStatus: false,

      subProfileName: '',
      subProfileContactPerson: '',
      subProfileNumber: '',
      subProfileEmail: '',
      password: '',
      privilege: ''
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
  }

  componentWillUnmount() {
    this.props.clearSubProfilesErrors();
  }

  componentDidUpdate() {
    if (this.props.error === false) {
      history.push('/add-sub-profile/success');
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

  renderPrivilege = () => {
    let options = [{
      value: 'select one...',
      label: this.props.t('data.selectOne')
    }];

    const privilegeList = ['manager', 'creator', 'viewer'];
    _.map(privilegeList, (item, i) => {
      let data = {
        value: item,
        label: this.props.t(`data.privilege.${item}`)
      };
      options.push(data);
    });

    return options;
  }

  handlePrivilegeChange = (e) => {
    this.props.clearSubProfilesErrors();
    this.setState({
      updatedStatus: true
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select one...') {
      this.setState({
        privilege: selectedValue
      });
    } else {
      this.setState({
        privilege: ''
      });
    }
  }

  handleOnChange(e) {
    this.props.clearSubProfilesErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = () => {
    this.props.clearSubProfilesErrors();

    const validatorList = [
      { fieldName: 'subProfileName', optional: false, type: 'text' },
      { fieldName: 'subProfileContactPerson', optional: false, type: 'text' },
      { fieldName: 'subProfileNumber', optional: false, type: 'text' },
      { fieldName: 'subProfileEmail', optional: false, type: 'email' },
      { fieldName: 'password', optional: true, type: 'password' },
      { fieldName: 'privilege', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      this.props.addSubProfile(this.props.shipperDetails.agent_application_secret_key, this.state.subProfileName, this.state.subProfileContactPerson,
        this.state.subProfileNumber, this.state.subProfileEmail, this.state.password,
        this.state.privilege);
      this.setState({
        updatedStatus: false
      });
    }
  }

  render() {
    return (
      <div>
        <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
          <Jumbotron className="p-4 border border-secondary">
            <InputField fieldName='sub profile name' i18nKey='subProfiles.subProfileName' placeholder='subProfiles.subProfileNamePlaceholder' name='subProfileName' type='text' stateValue={this.state.subProfileName} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='sub profile contact person' i18nKey='subProfiles.subProfileContactPerson' placeholder='subProfiles.subProfileContactPersonPlaceholder' name='subProfileContactPerson' type='text' stateValue={this.state.subProfileContactPerson} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='sub profile number' i18nKey='subProfiles.subProfileNumber' placeholder='subProfiles.subProfileNumberPlaceholder' name='subProfileNumber' type='text' stateValue={this.state.subProfileNumber} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='sub profile email' i18nKey='subProfiles.subProfileEmail' placeholder='subProfiles.subProfileEmailPlaceholder' name='subProfileEmail' type='email' stateValue={this.state.subProfileEmail} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='password' i18nKey='subProfiles.password' placeholder='subProfiles.passwordPlaceholder' name='password' type='password' stateValue={this.state.password} onChange={this.handleOnChange.bind(this)} />
            <DropdownField fieldName='privilege' i18nKey='subProfiles.privilege'
              placeholder={this.props.t('data.selectOne')} labelClassName="mb-2" dropdownClassName="mb-3"
              disableLabel={false} onChange={(e) => this.handlePrivilegeChange(e)} renderItems={this.renderPrivilege()} />
            {
              this.state.error === false ?
                <div className="alert alert-success m-0" role="alert">
                  <Trans i18nKey='subProfiles.addTeamMemberSuccess' />
                </div>
                :
                null
            }

            {
              this.state.errorData ?
                <div className="alert alert-danger m-0" role="alert">
                  <div><b><Trans i18nKey='orders.error' /></b></div>
                  {JSON.stringify(this.state.errorData)}
                </div>
                :
                null
            }

            <button
              type="button"
              className="w-100 btn btn-lg btn-success"
              onClick={this.handleSubmit}
              disabled={this.state.updatedStatus ? false : true}>
              <Trans i18nKey='subProfiles.add' />
            </button>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, subProfiles }) {
  return ({
    error: subProfiles.error,
    errorData: subProfiles.errorData,
    shipperDetails: shipperDetails.shipperDetails
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    addSubProfile,
    clearSubProfilesErrors
  }),
  withNamespaces('common')
)(AddSubProfile);
