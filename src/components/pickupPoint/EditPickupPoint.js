import React, { Component } from 'react';
import axios from 'axios'
import {ROOT_URL} from '../../actions'
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { history } from '../../utils/historyUtils';
import { validate } from '../../utils/validatorUtils';

import {
  fetchAllCountries
} from '../../actions/orderActions';
import {
  fetchPickupPointById,
  editPickupPoint,
  deletePickupPoint,
  clearPickupPointErrors
} from '../../actions/pickupPointActions';

import InputField from '../common/InputField';
import DropdownField from '../common/DropdownField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class EditPickupPoint extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      status: null,
      updatedStatus: false,
      anchorEl: null,
      stateLoading: false,
      cityLoading: false,

      pickupPointId: 0,
      pickupPointName: '',
      pickupPointAddress: '',
      pickupPointCountry: '',
      pickupPointState: '',
      pickupPointCity: '',
      pickupPointProvince: '',
      pickupPointPostal: '',
      pickupPointContactPerson: '',
      pickupPointNumber: '',
      pickupPointNote: '',
      pickupPointEmail: ''
    };
  }

  componentDidMount() {
    const currentPickupPointId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
    this.props.fetchPickupPointById(currentPickupPointId);

    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentWillUnmount() {
    this.props.clearPickupPointErrors();
  }

  componentDidUpdate() {
    if (this.props.pickupPoint && !this.state.pickupPointName) {
      this.setState({
        pickupPointId: this.props.pickupPoint.pickup_point_id,
        pickupPointName: this.props.pickupPoint.pickup_point_name,
        pickupPointAddress: this.props.pickupPoint.pickup_point_address,
        pickupPointCountry: this.props.pickupPoint.pickup_point_country,
        pickupPointState: this.props.pickupPoint.pickup_point_state,
        pickupPointCity: this.props.pickupPoint.pickup_point_city,
        pickupPointProvince: this.props.pickupPoint.pickup_point_province,
        pickupPointPostal: this.props.pickupPoint.pickup_point_postal,
        pickupPointContactPerson: this.props.pickupPoint.pickup_point_contact_person,
        pickupPointNumber: this.props.pickupPoint.pickup_point_number,
        pickupPointEmail: this.props.pickupPoint.pickup_point_email,
        pickupPointNote: this.props.pickupPoint.pickup_point_notes,
      });
    }

    if (this.state.status === 204) {
      history.push('/delete-pickup-point/success');
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

    if (this.props.status !== this.state.status) {
      this.setState({
        status: this.props.status
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

  renderCountries = () => {
    let option = [{
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.props.countries, (item, i) => {
      let data = {
        value: item,
        label: item
      }
      option.push(data);
    });

    return option;
  }

  renderStates = () => {
    let option = [{
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.state.states, (item, i) => {
      let data = {
        value: item.state_name,
        label: item.state_name
      }
      option.push(data);
    });

    return option;
  }

  renderCities = () => {
    let option = [{
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.state.cities, (item, i) => {
      let data = {
        value: item.city_name,
        label: item.display_name
      }
      option.push(data);
    });

    return option;
  }

  handleOnChange(e){
    this.props.clearPickupPointErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  

  fetchStates = () =>{
    this.setState({stateLoading: true})
    console.log(this.state.pickupPointCountry)
    const url = `${ROOT_URL}/location/states/`
    axios.get(`${url}?countries=${this.state.pickupPointCountry}`)
    .then((response) => {
      this.setState({stateLoading: false})
      console.log(response)
      this.setState({states: response.data})
    })
    .catch((error) => {
      this.setState({stateLoading: false})
      console.log(error.response.data)
    });
  }

  fetchCities = () =>{
    this.setState({cityLoading: true})
    console.log(this.state.pickupPointCountry)
    const url = `${ROOT_URL}/location/cities/`
    axios.get(`${url}?countries=${this.state.pickupPointCountry}&states=${this.state.pickupPointState}`)
    .then((response) => {
      this.setState({cityLoading: false})
      console.log(response)
      this.setState({cities: response.data})
    })
    .catch((error) => {
      this.setState({cityLoading: false})
      console.log(error.response.data)
    });
  }

  handleDropdownChange = (e, type) => {
    
    if (type === 'pickupPointCountry') {
      this.setState({
        pickupPointState: '',
        pickupPointCity: ''
      })
      const selectedPickupPointCountry = e.value;

      if (selectedPickupPointCountry !== 'select one...') {
        this.setState({
          pickupPointCountry: selectedPickupPointCountry,
          updatedStatus: true
        }, this.fetchStates);
      } else {
        this.setState({
          pickupPointCountry: '',
          updatedStatus: true
        });
      }
    }
    else if (type === 'pickupPointState') {
      this.setState({
        pickupPointCity: ''
      })
      const selectedPickupPointState = e.value;

      if (selectedPickupPointState !== 'select one...') {
        this.setState({
          pickupPointState: selectedPickupPointState,
          updatedStatus: true
        }, this.fetchCities);
      } else {
        this.setState({
          pickupPointState: '',
          updatedStatus: true
        });
      }
    }
    else {
      const selectedPickupPointCity = e.value;

      if (selectedPickupPointCity !== 'select one...') {
        this.setState({
          pickupPointCity: selectedPickupPointCity,
          updatedStatus: true
        });
      } else {
        this.setState({
          pickupPointCity: '',
          updatedStatus: true
        });
      }
    }
  }
  handleEdit = () => {
    this.props.clearPickupPointErrors();

    const validatorList = [
      { fieldName: 'pickupPointName', optional: false, type: 'text' },
      { fieldName: 'pickupPointAddress', optional: false, type: 'text' },
      { fieldName: 'pickupPointCountry', optional: false, type: 'text' },
      { fieldName: 'pickupPointState', optional: false, type: 'text' },
      { fieldName: 'pickupPointCity', optional: false, type: 'text' },
      { fieldName: 'pickupPointProvince', optional: false, type: 'text' },
      { fieldName: 'pickupPointPostal', optional: false, type: 'text' },
      { fieldName: 'pickupPointContactPerson', optional: false, type: 'text' },
      { fieldName: 'pickupPointNumber', optional: false, type: 'text' },
      { fieldName: 'pickupPointNote', optional: true, type: 'text' },
      { fieldName: 'pickupPointEmail', optional: false, type: 'email' },
    ];
    const canSubmit = validate(validatorList, this.state, true);
    console.log(canSubmit);

    if (canSubmit) {
      const data = {
        'pickup_point_name': this.state.pickupPointName,
        'pickup_point_address': this.state.pickupPointAddress,
        'pickup_point_country': this.state.pickupPointCountry,
        'pickup_point_state': this.state.pickupPointState,
        'pickup_point_city': this.state.pickupPointCity,
        'pickup_point_province': this.state.pickupPointProvince,
        'pickup_point_postal': this.state.pickupPointPostal,
        'pickup_point_contact_person': this.state.pickupPointContactPerson,
        'pickup_point_number': this.state.pickupPointNumber,
        'pickup_point_email': this.state.pickupPointEmail,
        'pickup_point_notes': this.state.pickupPointNote,
      };
      this.props.editPickupPoint(this.state.pickupPointId, data);
      this.setState({
        updatedStatus: false
      });
    }
  }

  handleDelete = () => {
    this.props.clearPickupPointErrors();

    if (this.state.pickupPointId) {
      this.props.deletePickupPoint(this.state.pickupPointId);
    }
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    let renderDiv = null;
    if (this.props.pickupPoint === undefined) {
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
          <InputField fieldName='pickup point name' i18nKey='pickupPoints.pickupPointName' placeholder='pickupPoints.pickupPointNamePlaceholder' name='pickupPointName' type='text' stateValue={this.state.pickupPointName} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point address' i18nKey='pickupPoints.pickupPointAddress' placeholder='pickupPoints.pickupPointAddressPlaceholder' name='pickupPointAddress' type='text' stateValue={this.state.pickupPointAddress} onChange={this.handleOnChange.bind(this)} />
          <DropdownField fieldName='pickup point country' i18nKey='pickupPoints.pickupPointCountry' placeholder={this.state.pickupPointCountry} labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointCountry')} renderItems={this.renderCountries()} />
          <DropdownField loading={this.state.stateLoading} value={this.state.pickupPointState} fieldName='pickup point state' i18nKey='pickupPoints.pickupPointState' placeholder={this.state.pickupPointState?this.state.pickupPointState: 'select one...'} labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointState')} renderItems={this.renderStates()} />
          <DropdownField loading={this.state.cityLoading} value={this.state.pickupPointCity} fieldName='pickup point city' i18nKey='pickupPoints.pickupPointCity' placeholder={this.state.pickupPointCity?this.state.pickupPointCity: 'select one...'} labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointCity')} renderItems={this.renderCities()} />
          {/* <InputField fieldName='pickup point state' i18nKey='pickupPoints.pickupPointState' placeholder='pickupPoints.pickupPointStatePlaceholder' name='pickupPointState' type='text' stateValue={this.state.pickupPointState} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point city' i18nKey='pickupPoints.pickupPointCity' placeholder='pickupPoints.pickupPointCityPlaceholder' name='pickupPointCity' type='text' stateValue={this.state.pickupPointCity} onChange={this.handleOnChange.bind(this)} /> */}
          <InputField fieldName='pickup point province' i18nKey='pickupPoints.pickupPointProvince' placeholder='pickupPoints.pickupPointProvincePlaceholder' name='pickupPointProvince' type='text' stateValue={this.state.pickupPointProvince} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point postal' i18nKey='pickupPoints.pickupPointPostal' placeholder='pickupPoints.pickupPointPostalPlaceholder' name='pickupPointPostal' type='text' stateValue={this.state.pickupPointPostal} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point contact person' i18nKey='pickupPoints.pickupPointContactPerson' placeholder='pickupPoints.pickupPointContactPersonPlaceholder' name='pickupPointContactPerson' type='text' stateValue={this.state.pickupPointContactPerson} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point number' i18nKey='pickupPoints.pickupPointNumber' placeholder='pickupPoints.pickupPointNumberPlaceholder' name='pickupPointNumber' type='text' stateValue={this.state.pickupPointNumber} onChange={this.handleOnChange.bind(this)} />
          <InputField fieldName='pickup point note' i18nKey='pickupPoints.pickupPointNote' placeholder='pickupPoints.pickupPointNotePlaceholder' name='pickupPointNote' type='textarea' stateValue={this.state.pickupPointNote} onChange={this.handleOnChange.bind(this)} rows="4" />
          <InputField fieldName='pickup point email' i18nKey='pickupPoints.pickupPointEmail' placeholder='pickupPoints.pickupPointEmailPlaceholder' name='pickupPointEmail' type='text' stateValue={this.state.pickupPointEmail} onChange={this.handleOnChange.bind(this)} />

          {
            this.state.error === false ?
            <div className="alert alert-success mt-2 mb-0" role="alert">
              { this.props.message }
            </div>
            :
            null
          }

          {
            this.state.errorData ?
            <div className="alert alert-danger mt-2 mb-0" role="alert">
              <div><b><Trans i18nKey="orders.error" /></b></div>
              { JSON.stringify(this.state.errorData) }
            </div>
            :
            null
          }

          <button
          type="button"
          className="mt-3 w-100 btn btn-lg btn-success"
          onClick={this.handleEdit}
          disabled={this.state.updatedStatus ? false : true}>
          <Trans i18nKey="pickupPoints.edit" />
          </button>

          <button
          type="button"
          className="mt-2 w-100 btn btn-lg btn-danger"
          onClick={this.handleDelete}>
          <Trans i18nKey="pickupPoints.delete" />
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

function mapStateToProps({ pickupPoint, order }) {
  return ({
    error: pickupPoint.error,
    errorData: pickupPoint.errorData,
    countries: order.countries,
    pickupPoint: pickupPoint.pickupPoint,
    message: pickupPoint.message,
    status: pickupPoint.status
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchAllCountries,
    fetchPickupPointById,
    editPickupPoint,
    deletePickupPoint,
    clearPickupPointErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(EditPickupPoint);
