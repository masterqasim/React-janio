import React, { Component } from 'react';
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import {
  fetchShipperDetails,
  fetchLanguages,
  editShipperDetails,
  clearShipperDetailsErrors
} from '../../actions/shipperDetailsActions';
import { validate } from '../../utils/validatorUtils';

import InputField from '../common/InputField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class ShipperDetails extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      updatedStatus: false,
      anchorEl: null,

      userId: 0,
      shipperName: '',
      shipperEmail: '',
      shipperNumber: '',
      isActive: false,
      enableSMS: false,
      enableEmail: false,
      privilege: '',
      language: ''
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.languages === undefined) {
      this.props.fetchLanguages();
    }
  }

  componentDidUpdate() {
    if (this.state.error === false) {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.shipperDetails && !this.state.userId) {
      this.setState({
        userId: this.props.shipperDetails.user_id,
        shipperName: this.props.shipperDetails.shipper_name,
        shipperEmail: this.props.shipperDetails.shipper_email,
        shipperNumber: this.props.shipperDetails.shipper_number,
        isActive: this.props.shipperDetails.is_active,
        enableSMS: this.props.shipperDetails.enable_sms,
        enableEmail: this.props.shipperDetails.enable_email,
        privilege: this.props.shipperDetails.privilege,
        language: this.props.shipperDetails.language
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

  renderCheckbox = (name, id, stateValue) => {
    return (
      <div className="form-check">
        <label className="form-check-label">
          <input
          name={name}
          id={id}
          type="checkbox"
          className="form-check-input"
          disabled={name === 'isActive' ? true : false}
          checked={stateValue}
          onChange={(e) => this.handleToggleCheckbox(e)}
          />
          {name}
        </label>
      </div>
    );
  }

  renderLanguages = () => {
    let option = [];

    let lang_mapping = {
      'chi': 'Chinese (Simplified)',
      'cht': 'Chinese (Traditional)',
      'ind': 'Bahasa Indonesia',
      'eng': 'English'
    }

    _.map(this.props.languages, (item, i) => {
      option.push(<option key={i} value={item}>{lang_mapping[item]}</option>);
    });

    return option;
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

  handleOnChange(e) {
    this.props.clearShipperDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleDropdownChange = (e) => {
    this.props.clearShipperDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleToggleCheckbox = (e) => {
    this.props.clearShipperDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    const { id } = e.target;
    this.setState({ [id]: !this.state[id] });
  }

  handleSubmit = () => {
    this.props.clearShipperDetailsErrors();

    const validatorList = [
      { fieldName: 'shipperName', optional: false, type: 'text' },
      { fieldName: 'shipperEmail', optional: false, type: 'email' },
      { fieldName: 'shipperNumber', optional: false, type: 'number' },
      { fieldName: 'language', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      if (this.state.enableSMS !== null && this.state.enableEmail !== null) {
        this.props.editShipperDetails(this.state.userId, this.state.shipperName, this.state.shipperEmail,
                                      this.state.shipperNumber, this.state.enableSMS, this.state.enableEmail,
                                      this.state.language);
        this.setState({
          updatedStatus: false
        });
      }
    }
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    let renderDiv = null;
    if (this.props.shipperDetails === undefined) {
      renderDiv = <div className="mt-5" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <ClipLoader
            color={'#273272'}
            loading={true}
          />
        </div>
      </div>;
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px'}}>
        <Jumbotron className="p-4 border border-secondary">
          <InputField fieldName='shipper name' i18nKey='shipperDetails.shipperName' placeholder='shipperDetails.shipperNamePlaceholder' name='shipperName' type='text' stateValue={this.state.shipperName} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='shipper email' i18nKey='shipperDetails.shipperEmail' placeholder='shipperDetails.shipperEmailPlaceholder' name='shipperEmail' type='email' stateValue={this.state.shipperEmail} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='shipper number' i18nKey='shipperDetails.shipperNumber' placeholder='shipperDetails.shipperNumberPlaceholder' name='shipperNumber' type='number' stateValue={this.state.shipperNumber} onChange={this.handleOnChange.bind(this)} />
          {/*{ this.renderCheckbox('isActive', 'isActive', this.state.isActive) }
          { this.renderCheckbox('enableSMS', 'enableSMS', this.state.enableSMS) }
          { this.renderCheckbox('enableEmail', 'enableEmail', this.state.enableEmail) }*/}
          <div className="my-3"></div>
          <InputField fieldName='privilege' i18nKey='shipperDetails.privilege' placeholder='shipperDetails.privilegePlaceholder' name='privilege' type='text' stateValue={this.state.privilege} disabled={true} onChange={this.handleOnChange.bind(this)} />
          <div>
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey='shipperDetails.language' />
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
              name="language"
              value={this.state.language}
              onChange={(e) => this.handleDropdownChange(e)}
            >
              { this.renderLanguages() }
            </select>
          </div>

          {
            this.state.error === false ?
            <div className="alert alert-success mt-2 mb-0" role="alert">
              <Trans i18nKey="shipperDetails.shipperDetailsUpdated" />
            </div>
            :
            null
          }

          <button
          type="button"
          className="mt-3 w-100 btn btn-lg btn-success"
          onClick={this.handleSubmit}
          disabled={this.state.updatedStatus ? false : true}>
          <Trans i18nKey="shipperDetails.submit" />
          </button>
        </Jumbotron>
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    )
  }
}

function mapStateToProps({ shipperDetails }) {
  return ({
    shipperDetails: shipperDetails.shipperDetails,
    languages: shipperDetails.languages,
    error: shipperDetails.error
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchLanguages,
    editShipperDetails,
    clearShipperDetailsErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(ShipperDetails);
