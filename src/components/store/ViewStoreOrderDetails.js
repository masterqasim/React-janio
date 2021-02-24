import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { validate } from '../../utils/validatorUtils';
import { history } from '../../utils/historyUtils';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchStoreOrderDetails,
  clearStoreErrors
} from '../../actions/storeActions';

import InputField from '../common/InputField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class ViewStoreOrderDetails extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      updatedStatus: false,
      added: false,
      secretKey: '',
      serviceId: 0,
      currentOrderId: null,
      currentStoreId: null,
      storeOrderDetails: null,
      anchorEl: null,

      consigneeName: '',
      consigneeAddress: '',
      consigneePostal: '',
      consigneeCountry: '',
      consigneeCity: '',
      consigneeState: '',
      consigneeProvince: '',
      consigneeNumber: '',
      consigneeEmail: '',
      shipperOrderId: '',
      orderLength: 0,
      orderWidth: 0,
      orderHeight: 0,
      orderWeight: 0,
      pickupCountry: '',
      pickupAddress: '',
      paymentType: '',
      itemsList: []
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.fetchShipperDetails();
  }

  componentDidUpdate() {
    const pathname = window.location.pathname.substring(30);
    const currentOrderId = parseInt(pathname.substr(0, pathname.lastIndexOf('/')), 10);
    const currentStoreId = parseInt(pathname.substr(pathname.lastIndexOf('/') + 1), 10);

    if (this.props.error !== this.state.error) {
      if (this.props.shipperDetails !== undefined) {
        this.props.fetchStoreOrderDetails(currentOrderId, this.props.shipperDetails.agent_application_secret_key, currentStoreId);
        this.setState({
          error: this.props.error
        });
      }
    }

    if (this.state.currentOrderId === null) {
      this.setState({
        currentOrderId: currentOrderId
      });
    }

    if (this.state.currentStoreId === null) {
      this.setState({
        currentStoreId: currentStoreId
      });
    }

    if (this.props.storeOrderDetails !== undefined) {
      if (this.props.storeOrderDetails !== this.state.storeOrderDetails) {
        if (this.state.currentOrderId !== null) {
          if (this.state.currentOrderId.toString() === this.props.storeOrderDetails[0].shipper_order_id && !this.state.added) {
            this.setState({
              storeOrderDetails: this.props.storeOrderDetails[0],
              added: true
            });
          }
        }
      }
    }

    if (!_.isEmpty(this.state.storeOrderDetails) && !this.state.consigneeName) {
      this.setState({
        consigneeName: this.state.storeOrderDetails.consignee_name !== null ? this.state.storeOrderDetails.consignee_name : '',
        consigneeAddress: this.state.storeOrderDetails.consignee_address !== null ? this.state.storeOrderDetails.consignee_address : '',
        consigneePostal: this.state.storeOrderDetails.consignee_postal !== null ? this.state.storeOrderDetails.consignee_postal : '',
        consigneeCountry: this.state.storeOrderDetails.consignee_country !== null ? this.state.storeOrderDetails.consignee_country : '',
        consigneeState: this.state.storeOrderDetails.consignee_state !== null ? this.state.storeOrderDetails.consignee_state : '',
        consigneeProvince: this.state.storeOrderDetails.consignee_province !== null ? this.state.storeOrderDetails.consignee_province : '',
        consigneeCity: this.state.storeOrderDetails.consignee_city !== null ? this.state.storeOrderDetails.consignee_city : '',
        consigneeNumber: this.state.storeOrderDetails.consignee_number !== null ? this.state.storeOrderDetails.consignee_number : '',
        consigneeEmail: this.state.storeOrderDetails.consignee_email !== null ? this.state.storeOrderDetails.consignee_email : '',
        shipperOrderId: this.state.storeOrderDetails.shipper_order_id !== null ? this.state.storeOrderDetails.shipper_order_id : '',
        orderLength: this.state.storeOrderDetails.order_length !== null ? this.state.storeOrderDetails.order_length : 0,
        orderWidth: this.state.storeOrderDetails.order_width !== null ? this.state.storeOrderDetails.order_width : 0,
        orderHeight: this.state.storeOrderDetails.order_height !== null ? this.state.storeOrderDetails.order_height : 0,
        orderWeight: this.state.storeOrderDetails.order_weight !== null ? this.state.storeOrderDetails.order_weight : 0,
        pickupAddress: this.state.storeOrderDetails.pickup_address !== null ? this.state.storeOrderDetails.pickup_address : '',
        pickupCountry: this.state.storeOrderDetails.pickup_country !== null ? this.state.storeOrderDetails.pickup_country : '',
        paymentType: this.state.storeOrderDetails.payment_type !== null ? this.state.storeOrderDetails.payment_type : '',
        itemsList: this.state.storeOrderDetails.items !== null ? this.state.storeOrderDetails.items : [],
      });

      _.map(this.state.itemsList, (item, i) => {
        let index = (i + 1);

        document.querySelector('#itemDesc' + index).value = item.item_desc !== null ? item.item_desc : '';
        document.querySelector('#itemQuantity' + index).value = item.item_quantity !== null ? item.item_quantity : '';
        document.querySelector('#itemProductId' + index).value = item.item_product_id !== null ? item.item_product_id : '';
        document.querySelector('#itemSku' + index).value = item.item_sku !== null ? item.item_sku : '';
        document.querySelector('#itemCategory' + index).value = item.item_category !== null ? item.item_category : '';
        document.querySelector('#itemPriceValue' + index).value = item.price_value !== null ? item.price_value : '';
        document.querySelector('#itemPriceCurrency' + index).value = item.item_price_currency !== null ? item.item_price_currency : '';
      });
    }
  }

  renderItem = (classes, anchorEl, open) => {
    return _.map(this.state.itemsList, (item, i) => {
      let index = (i + 1);

      return <Jumbotron key={index} className="mt-4 p-4 border border-secondary">
        <div><Trans i18nKey="orders.item" /> {index}<i id={parseInt(index, 10)} className="fas fa-times pointer float-right" onClick={this.handleDeleteItem}></i></div>
        <div className="container">
          <div className="row">
            <div className="col-sm">
              <div className="mt-3 border rounded max-width-40">
                <Jumbotron className="p-4 mb-0">
                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
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
                    </label>
                    <input
                    name={"itemDesc" + index}
                    type="text"
                    className="form-control"
                    id={"itemDesc" + index}
                    placeholder={this.props.t("orders.itemDescPlaceholder")}
                    defaultValue={item.item_desc !== null ? item.item_desc : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
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
                    </label>
                    <input
                    name={"itemQuantity" + index}
                    type="number"
                    className="form-control"
                    id={"itemQuantity" + index}
                    placeholder={this.props.t("orders.itemQuantityPlaceholder")}
                    defaultValue={item.item_quantity !== null ? item.item_quantity : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
                      <Trans i18nKey="orders.itemProductId" />
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
                    </label>
                    <input
                    name={"itemProductId" + index}
                    type="text"
                    className="form-control"
                    id={"itemProductId" + index}
                    placeholder={this.props.t("orders.itemProductIdPlaceholder")}
                    defaultValue={item.item_product_id !== null ? item.item_product_id : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>
                </Jumbotron>
              </div>
            </div>
            <div className="col-sm">
              <div className="mt-3 border rounded max-width-40">
                <Jumbotron className="p-4 mb-0">
                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
                      <Trans i18nKey="orders.itemSku" />
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
                    </label>
                    <input
                    name={"itemSku" + index}
                    type="text"
                    className="form-control"
                    id={"itemSku" + index}
                    placeholder={this.props.t("orders.itemSkuPlaceholder")}
                    defaultValue={item.item_sku !== null ? item.item_sku : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
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
                    </label>
                    <input
                    name={"itemCategory" + index}
                    type="text"
                    className="form-control"
                    id={"itemCategory" + index}
                    placeholder={this.props.t("orders.itemCategoryPlaceholder")}
                    defaultValue={item.item_category !== null ? item.item_category : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
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
                    </label>
                    <input
                    name={"itemPriceValue" + index}
                    type="number"
                    className="form-control"
                    id={"itemPriceValue" + index}
                    placeholder={this.props.t("orders.itemPriceValuePlaceholder")}
                    step="any"
                    defaultValue={item.item_price_value !== null ? item.item_price_value : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="h5 font-weight-bold capitalize">
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
                    </label>
                    <input
                    name={"itemPriceCurrency" + index}
                    type="text"
                    className="form-control"
                    id={"itemPriceCurrency" + index}
                    placeholder={this.props.t("orders.itemPriceCurrencyPlaceholder")}
                    defaultValue={item.item_price_currency !== null ? item.item_price_currency : ''}
                    onChange={this.handleOnChange.bind(this)}
                    />
                  </div>
                </Jumbotron>
              </div>
            </div>
          </div>
        </div>
      </Jumbotron>;
    })
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
        onChange={(e) => this.handleOnChange(e)}/>
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

  handleDeleteItem = () => {
    this.props.clearStoreErrors();

    if (this.state.itemsList.length > 0) {
      this.state.itemsList.pop();
    }
  }

  handleOnChange(e) {
    this.props.clearStoreErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleEdit = () => {
    this.props.clearStoreErrors();

    const validatorList = [
      { fieldName: 'consigneeName', optional: false, type: 'text' },
      { fieldName: 'consigneeAddress', optional: false, type: 'text' },
      { fieldName: 'consigneePostal', optional: false, type: 'text' },
      { fieldName: 'consigneeCountry', optional: false, type: 'text' },
      { fieldName: 'consigneeCity', optional: false, type: 'text' },
      { fieldName: 'consigneeState', optional: false, type: 'text' },
      { fieldName: 'consigneeProvince', optional: true, type: 'text' },
      { fieldName: 'consigneeNumber', optional: false, type: 'text' },
      { fieldName: 'shipperOrderId', optional: true, type: 'text' },
      { fieldName: 'consigneeEmail', optional: true, type: 'email' },
      { fieldName: 'orderLength', optional: false, type: 'number' },
      { fieldName: 'orderWidth', optional: false, type: 'number' },
      { fieldName: 'orderHeight', optional: false, type: 'number' },
      { fieldName: 'orderWeight', optional: false, type: 'number' },
      { fieldName: 'pickupCountry', optional: false, type: 'text' },
      { fieldName: 'pickupAddress', optional: false, type: 'text' },
      { fieldName: 'paymentType', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (canSubmit) {
      let itemsList = [];
      let allowSubmit = false;

      _.map(this.state.itemsList, (item, i) => {
        const index = (i + 1);
        const itemDescValue = document.querySelector('#itemDesc' + index).value !== null ? document.querySelector('#itemDesc' + index).value : '';
        const itemQuantityValue = document.querySelector('#itemQuantity' + index).value !== null ? document.querySelector('#itemQuantity' + index).value : '';
        const itemProductIdValue = document.querySelector('#itemProductId' + index).value !== null ? document.querySelector('#itemProductId' + index).value : '';
        const itemSkuValue = document.querySelector('#itemSku' + index).value !== null ? document.querySelector('#itemSku' + index).value : null;
        const itemCategoryValue = document.querySelector('#itemCategory' + index).value !== null ? document.querySelector('#itemCategory' + index).value: '';
        const itemPriceValueValue = document.querySelector('#itemPriceValue' + index).value !== null ? document.querySelector('#itemPriceValue' + index).value : '';
        const itemPriceCurrencyValue = document.querySelector('#itemPriceCurrency' + index).value !== null ? document.querySelector('#itemPriceCurrency' + index).value : '';

        let data = {
          "item_desc": itemDescValue,
          "item_quantity": parseInt(itemQuantityValue, 10),
          "item_product_id": itemProductIdValue,
          "item_sku": itemSkuValue,
          "item_category": itemCategoryValue,
          "item_price_value": parseFloat(parseFloat(itemPriceValueValue, 10).toFixed(2)),
          "item_price_currency": itemPriceCurrencyValue
        };
        itemsList.push(data);
      });

      _.map(itemsList, (item , i) => {
        if (item.item_quantity > 0) {
          allowSubmit = true;
        }
      });

      if (allowSubmit) {
        const currentOrderId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
        this.props.editOrder(
          currentOrderId, this.state.secretKey, this.state.serviceId,
          this.state.consigneeName, this.state.consigneeAddress, this.state.consigneePostal,
          this.state.consigneeCountry, this.state.consigneeCity, this.state.consigneeState,
          this.state.consigneeProvince, this.state.consigneeNumber, this.state.shipperOrderId,
          this.state.consigneeEmail, parseFloat(parseFloat(this.state.orderLength, 10).toFixed(2)), parseFloat(parseFloat(this.state.orderWidth, 10).toFixed(2)),
          parseFloat(parseFloat(this.state.orderHeight, 10).toFixed(2)), parseFloat(parseFloat(this.state.orderWeight, 10).toFixed(2)), this.state.pickupCountry,
          this.state.pickupAddress, this.state.paymentType, itemsList
        );
        this.setState({
          updatedStatus: false
        });
      }
    }
  }

  handleBackManageWebStoreOrders = () => {
    history.push('/view-web-store-orders');
  }

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    let renderDiv = null;
    if (_.isEmpty(this.state.storeOrderDetails)) {
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
      renderDiv = <div>
        <div className="container">
          <div className="h5 mt-4 font-weight-bold"><Trans i18nKey="orders.orderDetails" /></div>
          <div className="row">
            <div className="col-sm">
              <div className="mt-3 max-width-40">
                <Jumbotron className="p-4 border border-secondary">
                  <InputField fieldName='consignee name' i18nKey='orders.consigneeName' placeholder='orders.consigneeNamePlaceholder' name='consigneeName' type='text' stateValue={this.state.consigneeName} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee address' i18nKey='orders.consigneeAddress' placeholder='orders.consigneeAddressPlaceholder' name='consigneeAddress' type='text' stateValue={this.state.consigneeAddress} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee postal' i18nKey='orders.consigneePostal' placeholder='orders.consigneePostalPlaceholder' name='consigneePostal' type='text' stateValue={this.state.consigneePostal} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee country' i18nKey='orders.consigneeCountry' placeholder='orders.consigneeCountryPlaceholder' name='consigneeCountry' type='text' stateValue={this.state.consigneeCountry} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee state' i18nKey='orders.consigneeState' placeholder='orders.consigneeStatePlaceholder' name='consigneeState' type='text' stateValue={this.state.consigneeState} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee province' i18nKey='orders.consigneeProvince' placeholder='orders.consigneeProvincePlaceholder' name='consigneeProvince' type='text' stateValue={this.state.consigneeProvince} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee city' i18nKey='orders.consigneeCity' placeholder='orders.consigneeCityPlaceholder' name='consigneeCity' type='text' stateValue={this.state.consigneeCity} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='consignee number' i18nKey='orders.consigneeNumber' placeholder='orders.consigneeNumberPlaceholder' name='consigneeNumber' type='text' stateValue={this.state.consigneeNumber} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='shipper order id' i18nKey='orders.shipperOrderId' placeholder='orders.shipperOrderIdPlaceholder' name='shipperOrderId' type='text' stateValue={this.state.shipperOrderId} onChange={this.handleOnChange.bind(this)} />
                </Jumbotron>
              </div>
            </div>
            <div className="col-sm">
              <div className="mt-3 max-width-40">
                <Jumbotron className="p-4 border border-secondary">
                  <InputField fieldName='consignee email' i18nKey='orders.consigneeEmail' placeholder='orders.consigneeEmailPlaceholder' name='consigneeEmail' type='email' stateValue={this.state.consigneeEmail} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='order length (cm)' i18nKey='orders.orderLength' placeholder='orders.orderLengthPlaceholder' name='orderLength' type='number' stateValue={this.state.orderLength} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='order width (cm)' i18nKey='orders.orderWidth' placeholder='orders.orderWidthPlaceholder' name='orderWidth' type='number' stateValue={this.state.orderWidth} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='order height (cm)' i18nKey='orders.orderHeight' placeholder='orders.orderHeightPlaceholder' name='orderHeight' type='number' stateValue={this.state.orderHeight} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='order weight (kg)' i18nKey='orders.orderWeight' placeholder='orders.orderWeightPlaceholder' name='orderWeight' type='number' stateValue={this.state.orderWeight} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='pickup country' i18nKey='orders.pickupCountry' placeholder='orders.pickupCountryPlaceholder' name='pickupCountry' type='text' stateValue={this.state.pickupCountry} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='pickup address' i18nKey='orders.pickupAddress' placeholder='orders.pickupAddressPlaceholder' name='pickupAddress' type='text' stateValue={this.state.pickupAddress} onChange={this.handleOnChange.bind(this)} />
                  <InputField fieldName='payment type' i18nKey='orders.paymentType' placeholder='orders.paymentTypePlaceholder' name='paymentType' type='text' stateValue={this.state.paymentType} onChange={this.handleOnChange.bind(this)} />
                </Jumbotron>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="h5 font-weight-bold"><Trans i18nKey='orders.items' /></div>
          { this.renderItem(classes, anchorEl, open) }

          {
            this.state.error === false ?
            <div className="alert alert-success mt-2" role="alert">
              <Trans i18nKey="orders.updateOrderSuccess" />
            </div>
            :
            null
          }

          {/*<button
          type="button"
          className="mb-3 w-100 btn btn-lg btn-success"
          onClick={this.handleEdit}
          disabled={this.state.updatedStatus ? false : true}>
          Edit
          </button>*/}
          <button
          type="button"
          className="mb-3 w-100 btn btn-lg btn-success"
          onClick={this.handleBackManageWebStoreOrders}>
          <Trans i18nKey="stores.manageWebStoreOrders" />
          </button>
        </div>
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, store }) {
  return ({
    shipperDetails: shipperDetails.shipperDetails,
    error: store.error,
    storeOrderDetails: store.storeOrderDetails
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchStoreOrderDetails,
    clearStoreErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(ViewStoreOrderDetails);
