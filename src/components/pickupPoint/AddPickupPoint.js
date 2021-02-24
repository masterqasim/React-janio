import React, { Component } from "react";
import axios from 'axios'
import {ROOT_URL} from '../../actions'
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from '../../utils/historyUtils';
import { validate } from '../../utils/validatorUtils';

import {
  fetchAllCountries
} from '../../actions/orderActions';
import { addPickupPoint, clearPickupPointErrors } from '../../actions/pickupPointActions';

import InputField from '../common/InputField';
import DropdownField from '../common/DropdownField';

class AddPickupPoint extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      states: ['pick one...'],
      cities: ['pick one...'],
      stateLoading: false,
      cityLoading: false,
      countryCodeLoading: false,

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
      pickupPointEmail: '',
      countryCode: null
    };
  }

  componentDidMount() {
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentWillUnmount() {
    this.props.clearPickupPointErrors();
  }

  componentDidUpdate() {
    if (this.props.error === false) {
      if (this.props.onSuccess) {
        this.props.onSuccess()
        return
      }
      history.push('/add-pickup-point/success');
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

  fetchCountryCode = () => {
    this.setState({ countryCodeLoading: true })
    const url = `/api/data/phone-number/country-codes/?country=${this.state.pickupPointCountry}`
    axios.get(url)
    .then((response) => {
      const countryCode = response.data[0]
      this.setState({ countryCode, countryCodeLoading: false })
    })
    .catch((error) => {
      this.setState({ cityLoading: false })
      console.log(error.response.data)
    })
    .finally(() => {
      this.setState({ countryCodeLoading: false })
    })
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
          updated: true
        }, () => {
          this.fetchStates()
          this.fetchCountryCode()
        });
      } else {
        this.setState({
          pickupPointCountry: '',
          updated: true
        });
      }
    }
    else if (type === 'pickupPointState') {
      this.setState({
        pickupPointCity: ''
      })
      const selectedPickupPointState = e.value;
      console.log(selectedPickupPointState)

      if (selectedPickupPointState !== 'select one...') {
        this.setState({
          pickupPointState: selectedPickupPointState,
          updated: true
        }, this.fetchCities);
      } else {
        this.setState({
          pickupPointState: '',
          updated: true
        });
      }
    }
    else {
      const selectedPickupPointCity = e.value;

      if (selectedPickupPointCity !== 'select one...') {
        this.setState({
          pickupPointCity: selectedPickupPointCity,
          updated: true
        });
      } else {
        this.setState({
          pickupPointCity: '',
          updated: true
        });
      }
    }
  }

  handleOnChange(e) {
    this.props.clearPickupPointErrors();

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = () => {
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
        'pickup_point_number': this.state.countryCode.country_calling_code + this.state.pickupPointNumber,
        'pickup_point_notes': this.state.pickupPointNote,
        'pickup_point_email': this.state.pickupPointEmail
      };
      this.props.addPickupPoint(data);
    }
  }

  render() {
    return (
      <div>
        <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
          <Jumbotron className="p-4 border border-secondary">
            <InputField fieldName='pickup point name' i18nKey='pickupPoints.pickupPointName' placeholder='pickupPoints.pickupPointNamePlaceholder' name='pickupPointName' type='text' stateValue={this.state.pickupPointName} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='pickup point address' i18nKey='pickupPoints.pickupPointAddress' placeholder='pickupPoints.pickupPointAddressPlaceholder' name='pickupPointAddress' type='text' stateValue={this.state.pickupPointAddress} onChange={this.handleOnChange.bind(this)} />
            <DropdownField fieldName='pickup point country' i18nKey='pickupPoints.pickupPointCountry' placeholder='select one...' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointCountry')} renderItems={this.renderCountries()} />
            <DropdownField loading={this.state.stateLoading} fieldName='pickup point state' i18nKey='pickupPoints.pickupPointState' placeholder='select one...' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointState')} renderItems={this.renderStates()} />
            <DropdownField loading={this.state.cityLoading} fieldName='pickup point city' i18nKey='pickupPoints.pickupPointCity' placeholder='select one...' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupPointCity')} renderItems={this.renderCities()} />
            {/* <InputField fieldName='pickup point state' i18nKey='pickupPoints.pickupPointState' placeholder='pickupPoints.pickupPointStatePlaceholder' name='pickupPointState' type='text' stateValue={this.state.pickupPointState} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='pickup point city' i18nKey='pickupPoints.pickupPointCity' placeholder='pickupPoints.pickupPointCityPlaceholder' name='pickupPointCity' type='text' stateValue={this.state.pickupPointCity} onChange={this.handleOnChange.bind(this)} /> */}
            <InputField fieldName='pickup point province' i18nKey='pickupPoints.pickupPointProvince' placeholder='pickupPoints.pickupPointProvincePlaceholder' name='pickupPointProvince' type='text' stateValue={this.state.pickupPointProvince} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='pickup point postal' i18nKey='pickupPoints.pickupPointPostal' placeholder='pickupPoints.pickupPointPostalPlaceholder' name='pickupPointPostal' type='text' stateValue={this.state.pickupPointPostal} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='pickup point contact person' i18nKey='pickupPoints.pickupPointContactPerson' placeholder='pickupPoints.pickupPointContactPersonPlaceholder' name='pickupPointContactPerson' type='text' stateValue={this.state.pickupPointContactPerson} onChange={this.handleOnChange.bind(this)} />
            <InputField countryCode={this.state.countryCode} disabled={!this.state.countryCode || this.state.countryCodeLoading } fieldName='pickup point number' i18nKey='pickupPoints.pickupPointNumber' placeholder='pickupPoints.pickupPointNumberPlaceholder' name='pickupPointNumber' type='number' stateValue={this.state.pickupPointNumber} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='pickup point note' i18nKey='pickupPoints.pickupPointNote' placeholder='pickupPoints.pickupPointNotePlaceholder' name='pickupPointNote' type='textarea' stateValue={this.state.pickupPointNote} onChange={this.handleOnChange.bind(this)} rows="4" />
            <InputField fieldName='pickup point email' i18nKey='pickupPoints.pickupPointEmail' placeholder='pickupPoints.pickupPointEmailPlaceholder' name='pickupPointEmail' type='text' stateValue={this.state.pickupPointEmail} onChange={this.handleOnChange.bind(this)} />

            {
              this.state.error === false ?
                <div className="alert alert-success mt-2 mb-0" role="alert">
                  <Trans i18nKey="pickupPoints.addPickupPointSuccess" />
                </div>
                :
                null
            }

            {
              this.state.errorData ?
                <div className="alert alert-danger mt-2 mb-0" role="alert">
                  <div><b><Trans i18nKey="orders.error" /></b></div>
                  {JSON.stringify(this.state.errorData)}
                </div>
                :
                null
            }

            <button
              type="button"
              className={(!(this.state.pickupPointName && this.state.pickupPointAddress && this.state.pickupPointCountry && this.state.pickupPointState &&
                  this.state.pickupPointCity && this.state.pickupPointProvince && this.state.pickupPointPostal && this.state.pickupPointContactPerson &&
                  this.state.pickupPointNumber && this.state.pickupPointEmail)) ? "mt-3 w-100 btn btn-lg btn-secondary" : "mt-3 w-100 btn btn-lg btn-success"}
              onClick={this.handleSubmit}
              disabled={(!(this.state.pickupPointName && this.state.pickupPointAddress && this.state.pickupPointCountry && this.state.pickupPointState &&
                  this.state.pickupPointCity && this.state.pickupPointProvince && this.state.pickupPointPostal && this.state.pickupPointContactPerson &&
                  this.state.pickupPointNumber && this.state.pickupPointEmail))}>
              <Trans i18nKey="pickupPoints.submit" />
            </button>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ pickupPoint, order }) {
  return ({
    error: pickupPoint.error,
    errorData: pickupPoint.errorData,
    countries: order.countries,
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchAllCountries,
    addPickupPoint,
    clearPickupPointErrors
  }),
  withNamespaces('common')
)(AddPickupPoint);
