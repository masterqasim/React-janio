import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import { fetchPickupPoint } from '../../actions/pickupPointActions';
import {
  fetchService,
  fetchAllCountries,
  fetchItemCategory,
  fetchItemPriceCurrency,
  addOrders,
  clearOrderErrors
} from '../../actions/orderActions';
// import {
//   fetchPostalSearch
// } from '../../actions/searchPostalCodeActions';
import _ from 'lodash';
import { history } from '../../utils/historyUtils';
import { validate } from '../../utils/validatorUtils';

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

class SubmitOrder extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      openErrorAlert: false,
      updatedStatus: false,
      fetched: false,
      postalSearch: null,
      addedPostalSearch: false,
      addedService: false,
      addedPickupPoints: false,

      serviceId: 0,
      secretKey: '',
      index: 2,
      itemList: [],
      submitOrderFormDataDeleteList: [],
      anchorEl: null,

      allowPickup: null,
      trackingNo: localStorage.getItem('trackingNo') ? localStorage.getItem('trackingNo') : '',
      consigneeName: localStorage.getItem('consigneeName') ? localStorage.getItem('consigneeName') : '',
      consigneeAddress: localStorage.getItem('consigneeAddress') ? localStorage.getItem('consigneeAddress') : '',
      consigneePostal: localStorage.getItem('consigneePostal') ? localStorage.getItem('consigneePostal') : '',
      consigneeCountry: '',
      consigneeCity: localStorage.getItem('consigneeCity') ? localStorage.getItem('consigneeCity') : '',
      consigneeState: localStorage.getItem('consigneeState') ? localStorage.getItem('consigneeState') : '',
      consigneeProvince: localStorage.getItem('consigneeProvince') ? localStorage.getItem('consigneeProvince') : '',
      consigneeNumber: localStorage.getItem('consigneeNumber') ? localStorage.getItem('consigneeNumber') : '',
      consigneeEmail: localStorage.getItem('consigneeEmail') ? localStorage.getItem('consigneeEmail') : '',
      shipperOrderId: localStorage.getItem('shipperOrderId') ? localStorage.getItem('shipperOrderId') : '',
      orderLength: localStorage.getItem('orderLength') ? localStorage.getItem('orderLength') : 0,
      orderWidth: localStorage.getItem('orderWidth') ? localStorage.getItem('orderWidth') : 0,
      orderHeight: localStorage.getItem('orderHeight') ? localStorage.getItem('orderHeight') : 0,
      orderWeight: localStorage.getItem('orderWeight') ? localStorage.getItem('orderWeight') : 0,
      pickupCountry: localStorage.getItem('pickupCountry') ? localStorage.getItem('pickupCountry') : '',
      pickupContactName: localStorage.getItem('pickupContactName') ? localStorage.getItem('pickupContactName') : '',
      pickupContactNumber: localStorage.getItem('pickupContactNumber') ? localStorage.getItem('pickupContactNumber') : '',
      pickupState: localStorage.getItem('pickupState') ? localStorage.getItem('pickupState') : '',
      pickupCity: localStorage.getItem('pickupCity') ? localStorage.getItem('pickupCity') : '',
      pickupProvince: localStorage.getItem('pickupProvince') ? localStorage.getItem('pickupProvince') : '',
      pickupPostal: localStorage.getItem('pickupPostal') ? localStorage.getItem('pickupPostal') : '',
      pickupAddress: localStorage.getItem('pickupAddress') ? localStorage.getItem('pickupAddress') : '',
      paymentType: '',
      codAmountToCollect: localStorage.getItem('codAmountToCollect') ? localStorage.getItem('codAmountToCollect') : '',
      incoterm: null,

      itemDesc1: localStorage.getItem('itemDesc1') ? localStorage.getItem('itemDesc1') : '',
      itemQuantity1: localStorage.getItem('itemQuantity1') ? localStorage.getItem('itemQuantity1') : 0,
      itemProductId1: localStorage.getItem('itemProductId1') ? localStorage.getItem('itemProductId1') : '',
      itemSku1: localStorage.getItem('itemSku1') ? localStorage.getItem('itemSku1') : '',
      itemCategory1: '',
      itemPriceValue1: localStorage.getItem('itemPriceValue1') ? localStorage.getItem('itemPriceValue1') : 0,
      itemPriceCurrency1: '',
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    this.props.fetchPickupPoint();
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
    if (this.props.itemCategory === undefined) {
      this.props.fetchItemCategory();
    }
    if (this.props.itemPriceCurrency === undefined) {
      this.props.fetchItemPriceCurrency();
    }
  }

  componentWillUnmount() {
    this.props.clearOrderErrors();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.error === false) {
      this.clearSubmitOrderFormLocalStorageData();
      this.resetStateData();

      history.push('/submit-order/success');
    }

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.errorData !== undefined) {
      if (this.props.errorData !== this.state.errorData) {
        this.setState({
          openErrorAlert: true,
          errorData: this.props.errorData
        });
      }
    }

    if (this.props.service === undefined && this.state.secretKey.length > 0 && !this.state.fetched) {
      this.props.fetchService(this.state.secretKey);
      this.setState({
        fetched: true
      });
    }

    // if (this.props.postalSearch !== this.state.postalSearch) {
    //   this.setState({
    //     postalSearch: this.props.postalSearch,
    //     addedPostalSearch: false
    //   });
    // }
    //
    // if (!this.state.addedPostalSearch) {
    //   this.setState({
    //     consigneeState: !_.isEmpty(this.state.postalSearch) ? this.state.postalSearch[0].state : '',
    //     consigneeCity: !_.isEmpty(this.state.postalSearch) ? this.state.postalSearch[0].city : '',
    //     consigneeProvince: !_.isEmpty(this.state.postalSearch) ? this.state.postalSearch[0].province : '',
    //     addedPostalSearch: true
    //   });
    // }

    if ((localStorage.getItem('service') && localStorage.getItem('pickupPoint')) || (localStorage.getItem('service') && localStorage.getItem('pickupPoint') === null)) {
      if (!this.state.addedService) {
        _.map(this.props.service, (item, i) => {
          if (localStorage.getItem('service') === item.service_name) {
            const serviceIdValue = item.service_id;
            const allowPickup = item.allow_pickup;
            const pickupCountry = item.pickup_country;
            const pickupContactName = item.pickup_contact_name;
            const pickupContactNumber = item.pickup_contact_number;
            const pickupState = item.pickup_state;
            const pickupCity = item.pickup_city;
            const pickupProvince = item.pickup_province;
            const pickupPostal = item.pickup_postal;
            const pickupAddress = item.pickup_address;

            this.setState({
              serviceId: serviceIdValue,

              allowPickup: allowPickup
            });

            if (allowPickup === false) {
              this.setState({
                pickupCountry: pickupCountry ? pickupCountry : '',
                pickupContactName: pickupContactName ? pickupContactName : '',
                pickupContactNumber: pickupContactNumber ? pickupContactNumber : '',
                pickupState: pickupState ? pickupState : '',
                pickupCity: pickupCity ? pickupCity : '',
                pickupProvince: pickupProvince ? pickupProvince : '',
                pickupPostal: pickupPostal ? pickupPostal : '',
                pickupAddress: `${pickupAddress ? pickupAddress : ''}, ${pickupState ? pickupState : ''}, ${pickupCity ? pickupCity : ''}, ${pickupProvince ? pickupProvince : ''}`
              });
            }

            this.setState({
              addedService: true
            });
          }
        });
      }

      if (!this.state.addedPickupPoints) {
        _.map(this.props.pickupPoint, (item, i) => {
          if (localStorage.getItem('pickupPoint') === item.pickup_point_name && this.state.allowPickup === true) {
            const pickupPointCountry = item.pickup_point_country;
            const pickupPointContactPerson = item.pickup_point_contact_person;
            const pickupPointNumber = item.pickup_point_number;
            const pickupPointState = item.pickup_point_state;
            const pickupPointCity = item.pickup_point_city;
            const pickupPointProvince = item.pickup_point_province;
            const pickupPointPostal = item.pickup_point_postal;
            const pickupPointAddress = item.pickup_point_address;
            this.setState({
              pickupCountry: pickupPointCountry ? pickupPointCountry : '',
              pickupContactName: pickupPointContactPerson ? pickupPointContactPerson : '',
              pickupContactNumber: pickupPointNumber ? pickupPointNumber : '',
              pickupState: pickupPointState ? pickupPointState : '',
              pickupCity: pickupPointCity ? pickupPointCity : '',
              pickupProvince: pickupPointProvince ? pickupPointProvince : '',
              pickupPostal: pickupPointPostal ? pickupPointPostal : '',
              pickupAddress: `${pickupPointAddress ? pickupPointAddress : ''}, ${pickupPointState ? pickupPointState : ''}, ${pickupPointCity ? pickupPointCity : ''}, ${pickupPointCountry ? pickupPointCountry : ''}`,
              addedPickupPoints: true
            });
          }
        });
      }
    }

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
      });
    }
  }

  renderService = () => {
    let options = [{
      serviceId: 0,
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.props.service, (item, i) => {
      let data = {
        serviceId: item.service_id,
        value: item.service_name,
        label: item.service_name
      };
      options.push(data);
    });

    return options;
  }

  renderPickupPoint = () => {
    let options = [{
      pickupPointCountry: '',
      pickupPointContactPerson: '',
      pickupPointNumber: '',
      pickupPointState: '',
      pickupPointCity: '',
      pickupPointProvince: '',
      pickupPointPostal: '',
      pickupPointAddress: '',
      value: 'select one...',
      label: 'select one...'
    }];

    _.map(this.props.pickupPoint, (item, i) => {
      let data = {
        pickupPointCountry: item.pickup_point_country,
        pickupPointContactPerson: item.pickup_point_contact_person,
        pickupPointNumber: item.pickup_point_number,
        pickupPointState: item.pickup_point_state,
        pickupPointCity: item.pickup_point_city,
        pickupPointProvince: item.pickup_point_province,
        pickupPointPostal: item.pickup_point_postal,
        pickupPointAddress: item.pickup_point_address,
        value: item.pickup_point_name,
        label: item.pickup_point_name
      };
      options.push(data);
    });

    return options;
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

  renderPaymentType = () => {
    let options = [{
      value: 'select one...',
      label: this.props.t('data.selectOne')
    }];

    const paymentTypeList = ['prepaid', 'cod'];
    _.map(paymentTypeList, (item, i) => {
      let data = {
        value: item,
        label: this.props.t(`data.paymentType.${item}`)
      };
      options.push(data);
    });

    return options;
  }

  renderItemCategory = () => {
    return _.map(this.props.itemCategory, (item, i) => {
      const itemKey = item.replace(' ', '')
      return <option key={i} value={item}>{this.props.t(`data.categories.${itemKey}`)}</option>;
    })
  }

  renderItemPriceCurrency = () => {
    return _.map(this.props.itemPriceCurrency, (item, i) => {
      return <option key={i} value={item}>{item}</option>;
    });
  }

  renderNewItem = () => {
    return _.map(this.state.itemList, (item, i) => {
      return <div key={i}>{item}</div>
    });
  }

  renderErrorAlert = () => {
    let errorDataDiv = null;

    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.openErrorAlert) {
      const values = Object.values(this.state.errorData);

      let errorDataList = [];
      let itemStrList = null;
      _.map(values, (item, i) => {
        const itemStr = JSON.stringify(item).replace(/[\\["{}\]]/g, '');
        itemStrList = itemStr.split(',');
      });

      _.map(itemStrList, (item, i) => {
        errorDataList.push(<div key={i}>{item}</div>);
      });

      errorDataDiv = <div className="alert alert-danger mb-3" role="alert">
        <h5><b>Error</b></h5>
        {errorDataList}
      </div>;
    }

    return errorDataDiv;
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
          step="any"
          value={stateValue}
          onChange={(e) => this.handleOnChange(e)}
        />
      </div>
    );
  }

  renderTextarea = (fieldName, name, id, placeholder, stateValue) => {
    return (
      <div className="form-group">
        <label className="h5 font-weight-bold">{fieldName}</label>
        <textarea
          name={name}
          className="form-control"
          id={id}
          placeholder={placeholder}
          rows="3"
          value={stateValue}
          onChange={(e) => this.handleOnChange(e)} />
      </div>
    );
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

  handleServiceChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.value;
    console.log(selectedValue);
    localStorage.setItem('service', selectedValue);

    if (selectedValue !== 'select one...') {
      const secretKeyValue = this.props.shipperDetails.agent_application_secret_key;
      _.map(this.props.service, (item, i) => {
        if (selectedValue === item.service_name) {
          const serviceIdValue = item.service_id;
          const allowPickup = item.allow_pickup;
          const pickupCountry = item.pickup_country;
          const pickupContactName = item.pickup_contact_name;
          const pickupContactNumber = item.pickup_contact_number;
          const pickupState = item.pickup_state;
          const pickupCity = item.pickup_city;
          const pickupProvince = item.pickup_province;
          const pickupPostal = item.pickup_postal;
          const pickupAddress = item.pickup_address;

          this.setState({
            serviceId: serviceIdValue,
            secretKey: secretKeyValue,

            allowPickup: allowPickup
          });

          if (allowPickup === false) {
            this.setState({
              pickupCountry: pickupCountry ? pickupCountry : '',
              pickupContactName: pickupContactName ? pickupContactName : '',
              pickupContactNumber: pickupContactNumber ? pickupContactNumber : '',
              pickupState: pickupState ? pickupState : '',
              pickupCity: pickupCity ? pickupCity : '',
              pickupProvince: pickupProvince ? pickupProvince : '',
              pickupPostal: pickupPostal ? pickupPostal : '',
              pickupAddress: `${pickupAddress ? pickupAddress : ''}, ${pickupState ? pickupState : ''}, ${pickupCity ? pickupCity : ''}, ${pickupProvince ? pickupProvince : ''}`
            });
          } else {
            this.setState({
              pickupCountry: localStorage.getItem('pickupPoint') ? localStorage.getItem('pickupPoint') : '',
              pickupContactName: localStorage.getItem('pickupPointContactPerson') ? localStorage.getItem('pickupPointContactPerson') : '',
              pickupContactNumber: localStorage.getItem('pickupPointNumber') ? localStorage.getItem('pickupPointNumber') : '',
              pickupState: localStorage.getItem('pickupPointState') ? localStorage.getItem('pickupPointState') : '',
              pickupCity: localStorage.getItem('pickupPointCity') ? localStorage.getItem('pickupPointCity') : '',
              pickupProvince: localStorage.getItem('pickupPointProvince') ? localStorage.getItem('pickupPointProvince') : '',
              pickupPostal: localStorage.getItem('pickupPointPostal') ? localStorage.getItem('pickupPointPostal') : '',
              pickupAddress: localStorage.getItem('pickupPointAddress') ? localStorage.getItem('pickupPointAddress') : ''
            });
          }
        }
      });
    } else {
      localStorage.removeItem('service');
      this.setState({
        serviceId: 0,
        secretKey: '',
        allowPickup: null
      });
    }
  }

  handlePickupPointChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.value;
    console.log(selectedValue);
    localStorage.setItem('pickupPoint', selectedValue);

    if (selectedValue !== 'select one...') {
      _.map(this.props.pickupPoint, (item, i) => {
        if (selectedValue === item.pickup_point_name && this.state.allowPickup === true) {
          const pickupPointCountry = item.pickup_point_country;
          const pickupPointContactPerson = item.pickup_point_contact_person;
          const pickupPointNumber = item.pickup_point_number;
          const pickupPointState = item.pickup_point_state;
          const pickupPointCity = item.pickup_point_city;
          const pickupPointProvince = item.pickup_point_province;
          const pickupPointPostal = item.pickup_point_postal;
          const pickupPointAddress = item.pickup_point_address;
          localStorage.setItem('pickupPointCountry', pickupPointCountry);
          localStorage.setItem('pickupPointContactPerson', pickupPointContactPerson);
          localStorage.setItem('pickupPointNumber', pickupPointNumber);
          localStorage.setItem('pickupPointState', pickupPointState);
          localStorage.setItem('pickupPointCity', pickupPointCity);
          localStorage.setItem('pickupPointProvince', pickupPointProvince);
          localStorage.setItem('pickupPointPostal', pickupPointPostal);
          localStorage.setItem('pickupPointAddress', `${pickupPointAddress ? pickupPointAddress : ''}, ${pickupPointState ? pickupPointState : ''}, ${pickupPointCity ? pickupPointCity : ''}, ${pickupPointCountry ? pickupPointCountry : ''}`);
          this.setState({
            pickupCountry: pickupPointCountry ? pickupPointCountry : '',
            pickupContactName: pickupPointContactPerson ? pickupPointContactPerson : '',
            pickupContactNumber: pickupPointNumber ? pickupPointNumber : '',
            pickupState: pickupPointState ? pickupPointState : '',
            pickupCity: pickupPointCity ? pickupPointCity : '',
            pickupProvince: pickupPointProvince ? pickupPointProvince : '',
            pickupPostal: pickupPointPostal ? pickupPointPostal : '',
            pickupAddress: `${pickupPointAddress ? pickupPointAddress : ''}, ${pickupPointState ? pickupPointState : ''}, ${pickupPointCity ? pickupPointCity : ''}, ${pickupPointCountry ? pickupPointCountry : ''}`
          });
        }
      });
    } else {
      localStorage.removeItem('pickupPoint');
      localStorage.removeItem('pickupPointCountry');
      localStorage.removeItem('pickupPointContactPerson');
      localStorage.removeItem('pickupPointNumber');
      localStorage.removeItem('pickupPointState');
      localStorage.removeItem('pickupPointCity');
      localStorage.removeItem('pickupPointProvince');
      localStorage.removeItem('pickupPointPostal');
      localStorage.removeItem('pickupPointAddress');
      this.setState({
        pickupCountry: '',
        pickupContactName: '',
        pickupContactNumber: '',
        pickupState: '',
        pickupCity: '',
        pickupProvince: '',
        pickupPostal: '',
        pickupAddress: ''
      });
    }
  }

  handleCountryChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select one...') {
      this.setState({
        consigneeCountry: selectedValue,
        incoterm: this.state.pickupCountry !== selectedValue ? 'DDP':null
      });

      // if (this.state.secretKey && this.state.consigneePostal && selectedValue) {
      //   this.props.fetchPostalSearch(this.state.secretKey, this.state.consigneePostal, selectedValue);
      // }
    } else {
      this.setState({
        consigneeCountry: ''
      });
    }
  }

  handleStateChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    let selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== undefined) {
      if (!selectedValue.startsWith('select one...')) {
        this.setState({
          consigneeState: selectedValue
        });
      } else {
        this.setState({
          consigneeState: ''
        });
      }
    }
  }

  handleCityChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    let selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== undefined) {
      if (!selectedValue.startsWith('select one...')) {
        this.setState({
          consigneeCity: selectedValue
        });
      } else {
        this.setState({
          consigneeCity: ''
        });
      }
    }
  }

  handlePaymentTypeChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select one...') {
      this.setState({
        paymentType: selectedValue
      });
    } else {
      this.setState({
        paymentType: ''
      });
    }
  }

  handleItemCategoryChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.target.value;
    console.log(selectedValue);

    if (selectedValue !== undefined) {
      if (!selectedValue.startsWith('select one...')) {
        this.setState({
          itemCategory1: selectedValue
        });
      } else {
        this.setState({
          itemCategory1: ''
        });
      }
    }
  }

  handleItemPriceCurrencyChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const selectedValue = e.target.value;
    console.log(selectedValue);

    if (selectedValue !== undefined) {
      if (!selectedValue.startsWith('select one...')) {
        this.setState({
          itemPriceCurrency1: selectedValue
        });
      } else {
        this.setState({
          itemPriceCurrency1: ''
        });
      }
    }
  }

  handleOnChange(e) {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: true,
    });

    const { name, value } = e.target;
    if (!_.includes(this.state.submitOrderFormDataDeleteList, name)) {
      this.setState({
        submitOrderFormDataDeleteList: this.state.submitOrderFormDataDeleteList.concat(name)
      });
    }
    localStorage.setItem(name, value);
    this.setState({ [name]: value });
    // if (name === 'consigneePostal') {
    //   if (this.state.secretKey && value && this.state.consigneeCountry) {
    //     this.props.fetchPostalSearch(this.state.secretKey, value, this.state.consigneeCountry);
    //   }
    // }
  }

  handleAddItem = (classes, anchorEl, open) => {
    let newItem = <Jumbotron className="mt-4 p-4 border border-secondary">
      <div><Trans i18nKey="orders.item" /> {parseInt(this.state.index, 10)}<i id={parseInt(this.state.index, 10)} className="fas fa-times pointer float-right" onClick={(e) => this.handleDeleteItem(e)}></i></div>
      <div className="container">
        <div className="row">
          <div className="col-sm">
            <div className="mt-3 border rounded max-width-40">
              <Jumbotron className="p-4 mb-0">
                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemDesc" />
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
                  <input
                    name={"itemDesc" + parseInt(this.state.index, 10)}
                    type="text"
                    className="form-control"
                    id={"itemDesc" + parseInt(this.state.index, 10)}
                    placeholder={this.props.t("orders.itemDescPlaceholder")}
                    onChange={this.handleOnChange.bind(this)} />
                </div>

                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemQuantity" />
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
                  <input
                    name={"itemQuantity" + parseInt(this.state.index, 10)}
                    type="number"
                    className="form-control"
                    id={"itemQuantity" + parseInt(this.state.index, 10)}
                    placeholder={this.props.t("orders.itemQuantityPlaceholder")}
                    onChange={this.handleOnChange.bind(this)} />
                </div>

                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemProductId" />
                    <span className="text-secondary"> <Trans i18nKey="orders.optional" /></span>
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
                  <input
                    name={"itemProductId" + parseInt(this.state.index, 10)}
                    type="text"
                    className="form-control"
                    id={"itemProductId" + parseInt(this.state.index, 10)}
                    placeholder={this.props.t("orders.itemProductIdPlaceholder")}
                    onChange={this.handleOnChange.bind(this)} />
                </div>
              </Jumbotron>
            </div>
          </div>
          <div className="col-sm">
            <div className="mt-3 border rounded max-width-40">
              <Jumbotron className="p-4 mb-0">
                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemSku" />
                    <span className="text-secondary"> <Trans i18nKey="orders.optional" /></span>
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
                  <input
                    name={"itemSku" + parseInt(this.state.index, 10)}
                    type="text"
                    className="form-control"
                    id={"itemSku" + parseInt(this.state.index, 10)}
                    placeholder={this.props.t("orders.itemSkuPlaceholder")}
                    onChange={this.handleOnChange.bind(this)} />
                </div>

                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemCategory" />
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
                    id={"itemCategory" + parseInt(this.state.index, 10)}
                    className="custom-select"
                    onChange={(e) => this.handleItemCategoryChange(e)}>
                    <option>{this.props.t('data.selectOne')}</option>
                    {this.renderItemCategory()}
                  </select>
                </div>

                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemPriceValue" />
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
                  <input
                    name={"itemPriceValue" + parseInt(this.state.index, 10)}
                    type="number"
                    className="form-control"
                    id={"itemPriceValue" + parseInt(this.state.index, 10)}
                    step="any"
                    placeholder={this.props.t("orders.itemPriceValuePlaceholder")}
                    onChange={this.handleOnChange.bind(this)} />
                </div>

                <div className="form-group">
                  <div className="h5 font-weight-bold capitalize">
                    <Trans i18nKey="orders.itemPriceCurrency" />
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
                    id={"itemPriceCurrency" + parseInt(this.state.index, 10)}
                    className="custom-select"
                    onChange={(e) => this.handleItemPriceCurrencyChange(e)}>
                    <option>select one...</option>
                    {this.renderItemPriceCurrency()}
                  </select>
                </div>
              </Jumbotron>
            </div>
          </div>
        </div>
      </div>
    </Jumbotron>;

    this.setState({
      index: this.state.index + 1,
      itemList: this.state.itemList.concat(newItem)
    });
  }

  handleDeleteItem = (e) => {
    this.props.clearOrderErrors();

    let targetIndex = parseInt(e.target.getAttribute('id'), 10);
    if (this.state.itemList.length > 0) {
      let itemListLastIndex = this.state.itemList[this.state.itemList.length - 1].props.children[0].props.children[2];

      let newItemList = _.filter(this.state.itemList, (item, i) => {
        let itemIndex = item.props.children[0].props.children[2];
        return itemIndex !== targetIndex;
      });

      if (itemListLastIndex !== targetIndex) {
        this.setState({
          index: itemListLastIndex + 1,
          itemList: newItemList
        });
      } else {
        this.setState((prevState, props) => {
          if (this.state.itemList.length === 1 && prevState.index !== 2) {
            return {
              index: 2,
              itemList: newItemList
            }
          } else {
            return {
              index: this.state.index - 1,
              itemList: newItemList
            }
          }
        });
      }
    }
  }

  addItem1 = (itemsList) => {
    const itemDesc1Value = this.state.itemDesc1;
    const itemQuantity1Value = this.state.itemQuantity1;
    const itemProductId1Value = this.state.itemProductId1;
    const itemSku1Value = this.state.itemSku1;
    const itemCategory1Value = this.state.itemCategory1;
    const itemPriceValue1Value = this.state.itemPriceValue1;
    const itemPriceCurrency1Value = this.state.itemPriceCurrency1.substring(0, 3);
    let data = {
      "item_desc": itemDesc1Value,
      "item_quantity": parseFloat(parseFloat(itemQuantity1Value, 10).toFixed(2)),
      "item_product_id": itemProductId1Value,
      "item_sku": itemSku1Value,
      "item_category": itemCategory1Value,
      "item_price_value": parseFloat(parseFloat(itemPriceValue1Value, 10).toFixed(2)),
      "item_price_currency": itemPriceCurrency1Value
    };
    itemsList.push(data);
  }

  handleSubmit = () => {
    this.props.clearOrderErrors();
    this.setState({
      openErrorAlert: false,
      updatedStatus: false,
    });

    const validatorList = [
      { fieldName: 'trackingNo', optional: true, type: 'text' },
      { fieldName: 'consigneeName', optional: false, type: 'text' },
      { fieldName: 'consigneeCountry', optional: false, type: 'text' },
      { fieldName: 'consigneePostal', optional: false, type: 'text' },
      { fieldName: 'consigneeState', optional: false, type: 'text' },
      { fieldName: 'consigneeCity', optional: false, type: 'text' },
      { fieldName: 'consigneeProvince', optional: true, type: 'text' },
      { fieldName: 'consigneeAddress', optional: false, type: 'text' },
      { fieldName: 'consigneeNumber', optional: false, type: 'text' },
      { fieldName: 'consigneeEmail', optional: true, type: 'email' },
      { fieldName: 'shipperOrderId', optional: true, type: 'text' },
      { fieldName: 'orderLength', optional: false, type: 'number' },
      { fieldName: 'orderWidth', optional: false, type: 'number' },
      { fieldName: 'orderHeight', optional: false, type: 'number' },
      { fieldName: 'orderWeight', optional: false, type: 'number' },
      { fieldName: 'pickupCountry', optional: false, type: 'text' },
      { fieldName: 'pickupContactName', optional: true, type: 'text' },
      { fieldName: 'pickupContactNumber', optional: true, type: 'text' },
      { fieldName: 'pickupState', optional: true, type: 'text' },
      { fieldName: 'pickupCity', optional: true, type: 'text' },
      { fieldName: 'pickupProvince', optional: true, type: 'text' },
      { fieldName: 'pickupPostal', optional: true, type: 'text' },
      { fieldName: 'pickupAddress', optional: false, type: 'text' },
      { fieldName: 'paymentType', optional: false, type: 'text' },
      { fieldName: 'codAmountToCollect', optional: true, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (this.state.secretKey.length > 0 && this.state.serviceId > 0) {
      if (canSubmit) {
        let ordersList = [];
        let itemsList = [];
        if (this.state.itemList.length === 0) {
          this.addItem1(itemsList);
        } else {
          this.addItem1(itemsList);
          _.map(this.state.itemList, (item, i) => {
            let index = (i + 2);
            let itemDescValue = document.querySelector('#itemDesc' + index).value;
            let itemQuantityValue = document.querySelector('#itemQuantity' + index).value;
            let itemProductIdValue = document.querySelector('#itemProductId' + index).value;
            let itemSkuValue = document.querySelector('#itemSku' + index).value;
            let itemCategoryValue = document.querySelector('#itemCategory' + index).options[document.querySelector('#itemCategory' + index).selectedIndex].value;
            let itemPriceValueValue = document.querySelector('#itemPriceValue' + index).value;
            let itemPriceCurrencyValue = document.querySelector('#itemPriceCurrency' + index).value.substring(0, 3);
            let data = {
              "item_desc": itemDescValue,
              "item_quantity": parseFloat(itemQuantityValue, 10),
              "item_product_id": itemProductIdValue,
              "item_sku": itemSkuValue,
              "item_category": itemCategoryValue,
              "item_price_value": parseFloat(parseFloat(itemPriceValueValue, 10).toFixed(2)),
              "item_price_currency": itemPriceCurrencyValue
            };
            itemsList.push(data);
          });
        }

        let ordersListData = {
          "service_id": this.state.serviceId,
          "consignee_name": this.state.consigneeName,
          "consignee_number": this.state.consigneeNumber,
          "consignee_address": this.state.consigneeAddress,
          "consignee_postal": this.state.consigneePostal,
          "consignee_country": this.state.consigneeCountry,
          "consignee_city": this.state.consigneeCity,
          "consignee_state": this.state.consigneeState,
          "consignee_province": this.state.consigneeProvince,
          "consignee_email": this.state.consigneeEmail,
          "shipper_order_id": this.state.shipperOrderId,
          "tracking_no": this.state.trackingNo,
          "order_length": parseFloat(parseFloat(this.state.orderLength, 10).toFixed(2)),
          "order_width": parseFloat(parseFloat(this.state.orderWidth, 10).toFixed(2)),
          "order_height": parseFloat(parseFloat(this.state.orderHeight, 10).toFixed(2)),
          "order_weight": parseFloat(parseFloat(this.state.orderWeight, 10).toFixed(2)),
          "pickup_country": this.state.pickupCountry,
          "pickup_contact_name": this.state.pickupContactName,
          "pickup_contact_number": this.state.pickupContactNumber,
          "pickup_state": this.state.pickupState,
          "pickup_city": this.state.pickupCity,
          "pickup_province": this.state.pickupProvince,
          "pickup_postal": this.state.pickupPostal,
          "pickup_address": this.state.pickupAddress,
          "payment_type": this.state.paymentType,
          "incoterm": this.state.incoterm,
          "cod_amt_to_collect": !_.isEmpty(this.state.codAmountToCollect) ? parseFloat(parseFloat(this.state.codAmountToCollect, 10).toFixed(2)) : null,
          "items": itemsList
        };
        ordersList.push(ordersListData);

        if (ordersList.length > 0) {
          this.props.addOrders(this.state.secretKey, ordersList);
        }
      }
    }
  }

  clearSubmitOrderFormLocalStorageData = () => {
    if (localStorage.getItem('service'))
      localStorage.removeItem('service');
    if (localStorage.getItem('pickupPoint'))
      localStorage.removeItem('pickupPoint');

    _.map(this.state.submitOrderFormDataDeleteList, (item, i) => {
      localStorage.removeItem(item);
    });
  }

  resetStateData = () => {
    this.setState(this.state);
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <div className="mt-4 container">
          <div className="h5 mt-3 mb-3 font-weight-bold"><Trans i18nKey='orders.serviceConfiguration' /></div>
          <div className="row">
            <div className="col-sm">
              <Jumbotron className="p-4 border border-secondary">
                <DropdownField fieldName='service' placeholder={localStorage.getItem('service') ? localStorage.getItem('service') : 'select one...'} i18nKey='orders.service' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleServiceChange(e)} renderItems={this.renderService()} />
              </Jumbotron>
            </div>
            <div className="col-sm">
              <Jumbotron className="p-4 border border-secondary">
                <DropdownField fieldName='pickupPoint / pickup' placeholder={localStorage.getItem('pickupPoint') ? localStorage.getItem('pickupPoint') : 'select one...'} i18nKey='orders.pickup' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} allowPickup={this.state.allowPickup} onChange={(e) => this.handlePickupPointChange(e)} renderItems={this.renderPickupPoint()} />
                {
                  this.state.allowPickup === false ?
                    <div className="alert alert-warning mt-2" role="alert">
                      <Trans i18nKey='orders.pickupNotAvaiableForThisService' />
                      <br />
                      <Trans i18nKey='orders.pleaseDropoffThePackageAt' />
                      <br />
                      {this.state.pickupAddress} {this.state.pickupPostal} {this.state.pickupProvince} {this.state.pickupCity} {this.state.pickupState} {this.state.pickupCountry}
                    </div>
                    :
                    null
                }
              </Jumbotron>
            </div>
          </div>
        </div>

        {
          this.state.secretKey.length > 0 && this.state.serviceId > 0 && this.state.pickupCountry.length > 0 ?
            <div>
              <div className="container">
                <div className="h5 mt-2 font-weight-bold"><Trans i18nKey="orders.orderDetails" /></div>
                <div className="row">
                  <div className="col-sm">
                    <div className="mt-3 max-width-40">
                      <Jumbotron className="p-4 border border-secondary">
                        <InputField fieldName='tracking no' i18nKey='orders.trackingNo' placeholder='orders.trackingNoPlaceholder' name='trackingNo' type='text' stateValue={this.state.trackingNo} optional={true} onChange={this.handleOnChange.bind(this)} />
                        <div className="alert alert-secondary" role="alert">
                          <Trans i18nKey='orders.leaveBlankToAutoGenerate' />
                        </div>
                        <InputField fieldName='consignee name' i18nKey='orders.consigneeName' placeholder='orders.consigneeNamePlaceholder' name='consigneeName' type='text' stateValue={this.state.consigneeName} onChange={this.handleOnChange.bind(this)} />
                        <DropdownField fieldName='consignee country' i18nKey='orders.consigneeCountry' placeholder={this.props.t('data.selectOne')} labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleCountryChange(e)} renderItems={this.renderCountries()} />
                        <InputField fieldName='consignee postal' i18nKey='orders.consigneePostal' placeholder='orders.consigneePostalPlaceholder' name='consigneePostal' type='text' stateValue={this.state.consigneePostal} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee state' i18nKey='orders.consigneeState' placeholder='orders.consigneeStatePlaceholder' name='consigneeState' type='text' stateValue={this.state.consigneeState} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee city' i18nKey='orders.consigneeCity' placeholder='orders.consigneeCityPlaceholder' name='consigneeCity' type='text' stateValue={this.state.consigneeCity} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee province' i18nKey='orders.consigneeProvince' placeholder='orders.consigneeProvincePlaceholder' name='consigneeProvince' type='text' stateValue={this.state.consigneeProvince} optional={true} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee address' i18nKey='orders.consigneeAddress' placeholder='orders.consigneeAddressPlaceholder' name='consigneeAddress' type='textarea' stateValue={this.state.consigneeAddress} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee number' i18nKey='orders.consigneeNumber' placeholder='orders.consigneeNumberPlaceholder' name='consigneeNumber' type='text' stateValue={this.state.consigneeNumber} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='consignee email' i18nKey='orders.consigneeEmail' placeholder='orders.consigneeEmailPlaceholder' name='consigneeEmail' type='email' stateValue={this.state.consigneeEmail} optional={true} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='shipper order id' i18nKey='orders.shipperOrderId' placeholder='orders.shipperOrderIdPlaceholder' name='shipperOrderId' type='text' stateValue={this.state.shipperOrderId} optional={true} onChange={this.handleOnChange.bind(this)} />
                      </Jumbotron>
                    </div>
                  </div>
                  <div className="col-sm">
                    <div className="mt-3 max-width-40">
                      <Jumbotron className="p-4 border border-secondary">
                        <InputField fieldName='order length (cm)' i18nKey='orders.orderLength' placeholder='orders.orderLengthPlaceholder' name='orderLength' type='number' stateValue={this.state.orderLength} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='order width (cm)' i18nKey='orders.orderWidth' placeholder='orders.orderWidthPlaceholder' name='orderWidth' type='number' stateValue={this.state.orderWidth} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='order height (cm)' i18nKey='orders.orderHeight' placeholder='orders.orderHeightPlaceholder' name='orderHeight' type='number' stateValue={this.state.orderHeight} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='order weight (kg)' i18nKey='orders.orderWeight' placeholder='orders.orderWeightPlaceholder' name='orderWeight' type='number' stateValue={this.state.orderWeight} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup contact name' i18nKey='orders.pickupContactName' placeholder='orders.pickupContactNamePlaceholder' name='pickupContactName' type='text' stateValue={this.state.pickupContactName} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup contact number' i18nKey='orders.pickupContactNumber' placeholder='orders.pickupContactNumberPlaceholder' name='pickupContactNumber' type='text' stateValue={this.state.pickupContactNumber} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup state' i18nKey='orders.pickupState' placeholder='orders.pickupStatePlaceholder' name='pickupState' type='text' stateValue={this.state.pickupState} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup city' i18nKey='orders.pickupCity' placeholder='orders.pickupCityPlaceholder' name='pickupCity' type='text' stateValue={this.state.pickupCity} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup province' i18nKey='orders.pickupProvince' placeholder='orders.pickupProvincePlaceholder' name='pickupProvince' type='text' stateValue={this.state.pickupProvince} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup postal' i18nKey='orders.pickupPostal' placeholder='orders.pickupPostalPlaceholder' name='pickupPostal' type='text' stateValue={this.state.pickupPostal} optional={true} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <InputField fieldName='pickup address' i18nKey='orders.pickupAddress' placeholder='orders.pickupAddressPlaceholder' name='pickupAddress' type='textarea' stateValue={this.state.pickupAddress} allowPickup={this.state.allowPickup} onChange={this.handleOnChange.bind(this)} />
                        <DropdownField fieldName='payment type' i18nKey='orders.paymentType' placeholder={this.props.t('data.selectOne')} labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handlePaymentTypeChange(e)} renderItems={this.renderPaymentType()} />
                        {
                          this.state.paymentType === 'cod' ?
                            <div>
                              <InputField fieldName='cod amount to collect' i18nKey='orders.codAmountToCollect' placeholder='orders.codAmountToCollectPlaceholder' name='codAmountToCollect' type='number' stateValue={this.state.codAmountToCollect} optional={true} onChange={this.handleOnChange.bind(this)} />
                              <div className="alert alert-secondary" role="alert">
                                <Trans i18nKey='orders.leaveBlankToAutoCalculate' />
                              </div>
                            </div>
                            :
                            null
                        }

                        {
                        (this.state.pickupCountry && this.state.consigneeCountry) &&
                        (this.state.pickupCountry !== this.state.consigneeCountry) &&
                        <div>
                          <div className="h5 font-weight-bold capitalize">Incoterm</div>
                          <div className="custom-control custom-radio">
                            <input type="radio" className="custom-control-input"
                              id="incoterm-ddp" name="incoterm" value='DDP'
                              checked={this.state.incoterm === 'DDP'}
                              onChange={this.handleOnChange.bind(this)} />
                            <label className="custom-control-label" htmlFor="incoterm-ddp">DDP</label>
                          </div>

                          <div className="custom-control custom-radio">
                            <input type="radio" className="custom-control-input"
                              id="incoterm-ddu" name="incoterm" value='DDU'
                              checked={this.state.incoterm === 'DDU'}
                              onChange={this.handleOnChange.bind(this)} />
                            <label className="custom-control-label" htmlFor="incoterm-ddu">DDU</label>
                          </div>
                        </div>
                        }
                      </Jumbotron>
                    </div>
                  </div>
                </div>
              </div>

              <div className="container">
                <div className="h5 font-weight-bold"><Trans i18nKey='orders.items' /></div>
                <Jumbotron className="mt-4 p-4 border border-secondary">
                  <div><Trans i18nKey='orders.item1' /></div>
                  <div className="container">
                    <div className="row">
                      <div className="col-sm">
                        <div className="mt-3 border rounded max-width-40">
                          <Jumbotron className="p-4 mb-0">
                            <InputField fieldName='item desc' i18nKey='orders.itemDesc1' placeholder='orders.itemDesc1Placeholder' name='itemDesc1' type='text' stateValue={this.state.itemDesc1} onChange={this.handleOnChange.bind(this)} />
                            <InputField fieldName='item quantity' i18nKey='orders.itemQuantity1' placeholder='orders.itemQuantity1Placeholder' name='itemQuantity1' type='number' stateValue={this.state.itemQuantity1} onChange={this.handleOnChange.bind(this)} />
                            <InputField fieldName='item product id' i18nKey='orders.itemProductId1' placeholder='orders.itemProductId1Placeholder' name='itemProductId1' type='text' stateValue={this.state.itemProductId1} optional={true} onChange={this.handleOnChange.bind(this)} />
                          </Jumbotron>
                        </div>
                      </div>
                      <div className="col-sm">
                        <div className="mt-3 border rounded max-width-40">
                          <Jumbotron className="p-4 mb-0">
                            <InputField fieldName='item sku' i18nKey='orders.itemSku1' placeholder='orders.itemSku1Placeholder' name='itemSku1' type='text' stateValue={this.state.itemSku1} optional={true} onChange={this.handleOnChange.bind(this)} />
                            <div className="h5 font-weight-bold capitalize">
                              <Trans i18nKey='orders.itemCategory1' />
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
                            <select id="itemCategory1" className="mb-3 custom-select" defaultValue='' onChange={(e) => this.handleItemCategoryChange(e)}>
                              <option value='' disabled>{this.props.t('data.selectOne')}</option>
                              {this.renderItemCategory()}
                            </select>
                            <InputField fieldName='item price value (per unit)' i18nKey='orders.itemPriceValue1' placeholder='orders.itemPriceValue1Placeholder' name='itemPriceValue1' type='number' stateValue={this.state.itemPriceValue1} onChange={this.handleOnChange.bind(this)} />
                            <div className="h5 font-weight-bold capitalize">
                              <Trans i18nKey='orders.itemPriceCurrency1' />
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
                            <select id="itemPriceCurrency1" className="mb-3 custom-select" onChange={(e) => this.handleItemPriceCurrencyChange(e)}>
                              <option>{this.props.t('data.selectOne')}</option>
                              {this.renderItemPriceCurrency()}
                            </select>
                          </Jumbotron>
                        </div>
                      </div>
                    </div>
                  </div>
                </Jumbotron>

                {this.renderNewItem()}

                <button
                  type="button"
                  className="mb-3 w-100 btn btn-lg btn-secondary"
                  onClick={() => this.handleAddItem(classes, anchorEl, open)}
                >
                  <Trans i18nKey='orders.clickToAddOneMoreItem' />
                </button>

                {
                  this.state.error === false ?
                    <div className="alert alert-success mt-2" role="alert">
                      <Trans i18nKey='orders.submitOrderSuccess' />
                    </div>
                    :
                    null
                }

                {this.renderErrorAlert()}

                {
                  this.state.updatedStatus ?
                    <button
                      type="button"
                      className="mb-3 w-100 btn btn-lg btn-success"
                      onClick={this.handleSubmit}
                    >
                      <Trans i18nKey='orders.submitDeliveryOrder' />
                    </button>
                    :
                    <button
                      type="button"
                      className="mb-3 w-100 btn btn-lg btn-secondary"
                      onClick={this.handleSubmit}
                      disabled={true}
                    >
                      <Trans i18nKey='orders.submitDeliveryOrder' />
                    </button>
                }
              </div>
            </div>
            :
            <div className="container">
              <div className="alert alert-danger mt-2" role="alert">
                <Trans i18nKey='orders.pleaseSelectServiceAndPickupPointFirst' />
              </div>
            </div>
        }
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, pickupPoint, searchPostalCode, order }) {
  return ({
    error: order.error,
    errorData: order.errorData,
    shipperDetails: shipperDetails.shipperDetails,
    service: order.service,
    pickupPoint: pickupPoint.pickupPoints,
    countries: order.countries,
    postalSearch: searchPostalCode.postalSearch,
    itemCategory: order.itemCategory,
    itemPriceCurrency: order.itemPriceCurrency
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchService,
    fetchPickupPoint,
    fetchAllCountries,
    // fetchPostalSearch,
    fetchItemCategory,
    fetchItemPriceCurrency,
    addOrders,
    clearOrderErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(SubmitOrder);
