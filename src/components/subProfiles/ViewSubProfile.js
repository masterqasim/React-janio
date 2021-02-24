import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import moment from 'moment';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { history } from '../../utils/historyUtils';
import { validate } from '../../utils/validatorUtils';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchSubProfilesById,
  editSubProfile,
  deleteSubProfile,
  clearSubProfilesErrors
} from '../../actions/subProfilesActions';

import InputField from '../common/InputField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class ViewSubProfile extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      anchorEl: null,

      isEditSubProfile: null,
      isDeleteSubProfile: null,
      updatedStatus: false,
      added: false,
      fetched: false,
      agentApplicationId: null,
      subProfile: null,
      lastUpdated: moment(),
      loading: false,

      subProfileName: '',
      subProfileContactPerson: '',
      subProfileNumber: '',
      subProfileEmail: '',
      password: '',
      privilege: ''
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.fetchShipperDetails();
  }

  componentWillUnmount() {
    this.props.clearSubProfilesErrors();
  }

  componentDidUpdate() {
    const pathname = window.location.pathname.substring(18);
    const agentApplicationId = parseInt(pathname.substr(0, pathname.lastIndexOf('/')), 10);

    if (this.props.error === false && this.state.isDeleteSubProfile) {
      history.push('/delete-sub-profile/success');
    }

    if (this.props.error !== this.state.error) {
      if (this.props.shipperDetails !== undefined && !this.state.agentApplicationName) {
        this.props.fetchSubProfilesById(agentApplicationId, this.props.shipperDetails.agent_application_secret_key);
      }
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.errorData !== this.state.errorData) {
      this.setState({
        errorData: this.props.errorData
      });
    }

    if (this.props.lastUpdated && this.state.lastUpdated) {
      if ((this.props.lastUpdated.valueOf() > this.state.lastUpdated.valueOf()) && this.state.loading) {
        this.setState({
          loading: false
        });
      }
    }

    if (this.props.lastUpdated > this.state.lastUpdated) {
      this.setState({
        lastUpdated: this.props.lastUpdated
      });
    }

    if (!this.state.agentApplicationId) {
      this.setState({
        agentApplicationId: agentApplicationId
      });
    }

    if (this.props.subProfile !== undefined) {
      if (this.props.subProfile !== this.state.subProfile && !this.state.added) {
        this.setState({
          subProfile: this.props.subProfile,
          added: true
        });
      }
    }

    if (!_.isEmpty(this.state.subProfile) && !this.state.fetched) {
      this.setState({
        subProfileName: this.state.subProfile.agent_application_name !== null ? this.state.subProfile.agent_application_name : '',
        subProfileContactPerson: this.state.subProfile.agent_application_contact_person !== null ? this.state.subProfile.agent_application_contact_person : '',
        subProfileNumber: this.state.subProfile.agent_application_number !== null ? this.state.subProfile.agent_application_number : '',
        subProfileEmail: this.state.subProfile.agent_application_email !== null ? this.state.subProfile.agent_application_email : '',
        privilege: this.state.subProfile.privilege !== null ? this.state.subProfile.privilege : '',
        fetched: true
      });
    }
  }

  handlePopoverOpen = (e) => {
    this.setState({
      anchorEl: e.currentTarget
    });
  };

  handlePopoverClose = () => {
    this.setState({
      anchorEl: null
    });
  };

  handleDropdownChange = (e) => {
    this.props.clearSubProfilesErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleOnChange(e) {
    this.props.clearSubProfilesErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleEdit = () => {
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
      this.props.editSubProfile(this.state.agentApplicationId, this.props.shipperDetails.agent_application_secret_key,
                                this.state.subProfileName, this.state.subProfileContactPerson, this.state.subProfileNumber,
                                this.state.subProfileEmail, this.state.password, this.state.privilege);
      this.setState({
        loading: true,
        updatedStatus: false,
        isEditSubProfile: true
      });
    }
  }

  handleDelete = () => {
    this.props.clearSubProfilesErrors();

    this.props.deleteSubProfile(this.state.agentApplicationId, this.props.shipperDetails.agent_application_secret_key);
    this.setState({
      loading: true,
      isDeleteSubProfile: true
    });
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    let renderDiv = null;
    if (_.isEmpty(this.state.subProfile)) {
      renderDiv = <div>
        <div className="mt-5" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block' }}>
            <ClipLoader
              color={'#273272'}
              loading={true}
            />
          </div>
        </div>
      </div>;
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px'}}>
        <Jumbotron className="p-4 border border-secondary">
          <InputField fieldName='sub profile name' i18nKey='subProfiles.subProfileName' placeholder='subProfiles.subProfileNamePlaceholder' name='subProfileName' type='text' stateValue={this.state.subProfileName} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='sub profile contact person' i18nKey='subProfiles.subProfileContactPerson' placeholder='subProfiles.subProfileContactPersonPlaceholder' name='subProfileContactPerson' type='text' stateValue={this.state.subProfileContactPerson} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='sub profile number' i18nKey='subProfiles.subProfileNumber' placeholder='subProfiles.subProfileNumberPlaceholder' name='subProfileNumber' type='text' stateValue={this.state.subProfileNumber} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='sub profile email' i18nKey='subProfiles.subProfileEmail' placeholder='subProfiles.subProfileEmailPlaceholder' name='subProfileEmail' type='email' stateValue={this.state.subProfileEmail} disabled={true} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='password' i18nKey='subProfiles.password' placeholder='subProfiles.passwordPlaceholder' name='password' type='password' stateValue={this.state.password} onChange={this.handleOnChange.bind(this)} />
          <div className="alert alert-warning" role="alert">
            <Trans i18nKey="subProfiles.enterPasswordToChange" />
          </div>
          <div>
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey='subProfiles.privilege' />
              <i onMouseEnter={this.handlePopoverOpen} onMouseLeave={this.handlePopoverClose} className="far fa-sm fa-question-circle ml-2"></i>
              {/*<Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                  paper: classes.paper,
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                onClose={this.handlePopoverClose}
                disableRestoreFocus
              >
                <div></div>
              </Popover>*/}
            </div>
            <select
              className="mb-3 custom-select"
              name="privilege"
              value={this.state.privilege}
              onChange={(e) => this.handleDropdownChange(e)}
            >
              <option value="manager">{this.props.t('data.privilege.manager')}</option>
              <option value="creator">{this.props.t('data.privilege.creator')}</option>
              <option value="viewer">{this.props.t('data.privilege.viewer')}</option>
            </select>
          </div>

          {
            this.state.loading ?
            <div className="alert alert-warning text-center mb-2" role="alert"><Trans i18nKey='orders.loading' /></div>
            :
            null
          }

          {
            this.state.error === false && this.state.isEditSubProfile ?
            <div className="alert alert-success mb-2" role="alert">
              <Trans i18nKey='subProfiles.editTeamSuccess' />
            </div>
            :
            null
          }

          {
            this.state.errorData ?
            <div className="alert alert-danger mb-2" role="alert">
              <div><b><Trans i18nKey='orders.error' /></b></div>
              { JSON.stringify(this.state.errorData) }
            </div>
            :
            null
          }

          <button
          type="button"
          className="mb-2 w-100 btn btn-lg btn-success"
          onClick={this.handleEdit}
          disabled={this.state.updatedStatus ? false : true}>
          <Trans i18nKey='subProfiles.edit' />
          </button>

          <button
          type="button"
          className="w-100 btn btn-lg btn-danger"
          onClick={this.handleDelete}>
          <Trans i18nKey='subProfiles.delete' />
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

function mapStateToProps({ shipperDetails, subProfiles }) {
  return ({
    shipperDetails: shipperDetails.shipperDetails,
    error: subProfiles.error,
    errorData: subProfiles.errorData,
    subProfile: subProfiles.subProfile,
    lastUpdated: subProfiles.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchSubProfilesById,
    editSubProfile,
    deleteSubProfile,
    clearSubProfilesErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(ViewSubProfile);
