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
  fetchStoreTypes,
  addStore,
  clearStoreErrors
} from '../../actions/storeActions';

import InputField from '../common/InputField';
import DropdownField from '../common/DropdownField';

class AddStore extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      updatedStatus: false,
      requiredFields: [],
      storeType: '',
      storeUrl: '',
      apiKey: '',
      password: '',
      sharedSecret: '',
      storeKey: ''
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.storeTypes === undefined) {
      this.props.fetchStoreTypes();
    }
  }

  componentWillUnmount() {
    this.props.clearStoreErrors();
  }

  componentDidUpdate() {
    if (this.props.error === false) {
      history.push('/add-web-store/success');
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
    this.props.clearStoreErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleStoreTypeChange = (e) => {
    this.props.clearStoreErrors();
    this.setState({
      updatedStatus: true
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select one...') {
      this.setState({
        storeType: selectedValue,
        requiredFields: []
      });

      let newRequiredFieldsList = [];
      _.map(this.props.storeTypes, (item, i) => {
        if (selectedValue === item.store_type) {
          const requiredFieldsList = item.required_fields;
          _.map(requiredFieldsList, (requiredField, i) => {
            newRequiredFieldsList.push(requiredField);
          });
        }
      });

      this.setState({
        requiredFields: newRequiredFieldsList
      });
    } else {
      this.setState({
        storeType: '',
        requiredFields: []
      });
    }
  }

  renderStoreType = () => {
    let options = [{
      value: 'select one...',
      label: 'select one...'
    }];

    _.forEach(this.props.storeTypes, (item, i) => {
      let data = {
        value: item.store_type,
        label: item.store_type
      }
      options.push(data);
    });

    return options;
  }

  renderInputField = () => {
    let inputField = [];

    if (this.state.storeType !== null) {
      _.map(this.state.requiredFields, (fields, i) => {
        fields = fields.split('_');
        const formatedFieldNameWithSpace = fields.join().replace(/,/g, ' ');

        const formatedFields = _.map(fields, (item, i) => {
          return item.charAt(0).toUpperCase() + item.slice(1);
        });
        const formatedFieldName = formatedFields.join().replace(/,/g, '').charAt(0).toLowerCase() + formatedFields.join().replace(/,/g, '').slice(1);

        inputField.push(<div key={i}>
          <InputField fieldName={formatedFieldNameWithSpace} name={formatedFieldName} type='text' stateValue={this.state[formatedFieldName]} disableLabel={true} onChange={this.handleOnChange.bind(this)} />
        </div>);
      });
    }

    return inputField;
  }

  handleSubmit = () => {
    this.props.clearStoreErrors();

    let validatorList = [];
    if (this.state.storeType === 'shopify') {
      validatorList = [
        { fieldName: 'storeType', optional: false, type: 'text' },
        { fieldName: 'storeUrl', optional: false, type: 'text' },
        { fieldName: 'apiKey', optional: false, type: 'text' },
        { fieldName: 'password', optional: false, type: 'text' },
        { fieldName: 'sharedSecret', optional: false, type: 'text' },
      ];
    } else if (this.state.storeType === 'woocommerce' || this.state.storeType === 'magento') {
      validatorList = [
        { fieldName: 'storeType', optional: false, type: 'text' },
        { fieldName: 'storeUrl', optional: false, type: 'text' },
        { fieldName: 'storeKey', optional: false, type: 'text' },
      ];
    }
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (canSubmit) {
      let newObj = {};
      _.map(this.state.requiredFields, (fields, i) => {
        fields = fields.split('_');
        const formatedFieldsWithUnderscore = fields.join().replace(/,/g, '_');

        const formatedFields = _.map(fields, (item, i) => {
          if (i !== 0) {
            item = item.charAt(0).toUpperCase() + item.slice(1);
          }
          return item;
        });
        const formatedFieldName = formatedFields.join().replace(/,/g, '');

        const value = this.state[formatedFieldName];
        newObj[formatedFieldsWithUnderscore] = value;
      });

      let data = {
        "secret_key": this.props.shipperDetails.agent_application_secret_key,
        "store_type": this.state.storeType,
      };
      const combineDataObj = Object.assign(data, newObj);
      console.log(combineDataObj)

      this.props.addStore(combineDataObj);
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
            <DropdownField fieldName='store type' i18nKey='stores.storeType' placeholder='select one...' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleStoreTypeChange(e)} renderItems={this.renderStoreType()} />
            <div className="mb-3" />
            {this.renderInputField()}

            {
              this.state.error === false ?
                <div className="alert alert-success mt-2" role="alert">
                  <Trans i18nKey="stores.addStoreSuccess" />
                </div>
                :
                null
            }

            {
              this.state.errorData ?
                <div className="alert alert-danger m-0" role="alert">
                  <div><b><Trans i18nKey="orders.error" /></b></div>
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
              <Trans i18nKey="stores.submit" />
            </button>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, store }) {
  return ({
    error: store.error,
    errorData: store.errorData,
    shipperDetails: shipperDetails.shipperDetails,
    storeTypes: store.storeTypes
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchStoreTypes,
    addStore,
    clearStoreErrors
  }),
  withNamespaces('common')
)(AddStore);
