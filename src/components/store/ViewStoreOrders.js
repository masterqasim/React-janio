import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import ReactTable from "react-table";
import "react-table/react-table.css";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from '../../utils/historyUtils';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchService,
  fetchItemCategory,
  addOrders,
  clearOrderErrors
} from '../../actions/orderActions';
import { fetchPickupPoint } from '../../actions/pickupPointActions';
import {
  fetchPrevious,
  fetchNext,
  fetchStore,
  fetchStoreOrderByFilter,
  fetchPostalIdentifier,
  clearStoreErrors
} from '../../actions/storeActions';

import DropdownField from '../common/DropdownField';

class ViewStoreOrders extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      fetched: false,
      fetchedStoreOrders: false,

      status: null,
      secretKey: '',
      serviceId: 0,
      storeId: null,
      orderId: null,
      isAdded: 'false',
      createdFrom: null,
      modifiedFrom: null,

      shipperOrderIdStatus: true,
      consigneeNameStatus: true,
      consigneeEmailStatus: true,
      consigneeAddressStatus: true,
      consigneeCountryStatus: true,
      consigneePostalStatus: true,
      consigneeNumberStatus: true,
      orderWeightStatus: true,

      pickupCountry: '',
      pickupAddress: '',
      paymentType: '',
      itemCategory: '',

      selectAll: false,
      page: 1,
      selectedDataList: [],
      selectedAllDataList: [],
      lastUpdated: moment(),
      loading: false,
      showAllPageNums: false,

      shipperOrderIdList: [],
      postalIdentifierList: [],
      addOrdersLoading: false
    };

    this.throttledFetch = _.throttle(this.fetchStoreOrders, 3000, { 'trailing': true });
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    this.props.fetchPickupPoint();
    if (this.props.itemCategory === undefined) {
      this.props.fetchItemCategory();
    }
  }

  componentDidUpdate() {
    if (this.props.error === false) {
      history.push('/submit-store-order/success');
    }

    if (this.state.secretKey && !this.state.fetchedStoreOrders) {
      this.props.fetchStore(this.state.secretKey);
      this.fetchStoreOrders();
      this.setState({
        fetchedStoreOrders: true
      });
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

    if (this.props.service === undefined && this.state.secretKey.length > 0 && !this.state.fetched) {
      this.props.fetchService(this.state.secretKey);
      this.setState({
        fetched: true
      });
    }

    if (this.props.postalIdentifier !== undefined) {
      if (!_.includes(this.state.postalIdentifierList, this.props.postalIdentifier)) {
        this.setState({
          postalIdentifierList: this.state.postalIdentifierList.concat(this.props.postalIdentifier)
        });
      }
    }

    if (this.state.shipperOrderIdList.length > 0) {
      _.map(this.state.postalIdentifierList, (item, i) => {
        const shipperOrderId = this.state.shipperOrderIdList[i];
        if (this.props.postalIdentifier !== undefined) {
          Object.assign(this.props.postalIdentifier, {
            shipperOrderId: shipperOrderId
          });
        }
      });
    }

    if (this.state.postalIdentifierList.length > 0) {
      _.map(this.state.postalIdentifierList, (item, i) => {
        const shipperOrderId = item.shipperOrderId;
        const state = item.state;
        const city = item.city;
        const province = item.province;

        if (document.querySelector('#state-' + shipperOrderId) !== null) {
          if (_.isEmpty(document.querySelector('#state-' + shipperOrderId).value) && parseInt(document.querySelector('#stateBackspaceCounter-' + shipperOrderId).innerHTML, 10) === 0) {
            document.querySelector('#state-' + shipperOrderId).value = state;
          }
        }
        if (document.querySelector('#city-' + shipperOrderId) !== null) {
          if (_.isEmpty(document.querySelector('#city-' + shipperOrderId).value) && parseInt(document.querySelector('#cityBackspaceCounter-' + shipperOrderId).innerHTML, 10) === 0) {
            document.querySelector('#city-' + shipperOrderId).value = city;
          }
        }
        if (document.querySelector('#province-' + shipperOrderId) !== null) {
          if (_.isEmpty(document.querySelector('#province-' + shipperOrderId).value) && parseInt(document.querySelector('#provinceBackspaceCounter-' + shipperOrderId).innerHTML, 10) === 0) {
            document.querySelector('#province-' + shipperOrderId).value = province;
          }
        }

        if (document.querySelector('#state-' + shipperOrderId) !== null) {
          document.querySelector('#state-' + shipperOrderId).addEventListener('keyup', (e) => {
            if ((e.keyCode === 8 || e.which === 8) || (e.keyCode === 46 || e.which === 46)) {
              document.querySelector('#stateBackspaceCounter-' + shipperOrderId).innerHTML = parseInt(document.querySelector('#stateBackspaceCounter-' + shipperOrderId).innerHTML, 10) + 1;
              document.querySelector('#state-' + shipperOrderId).value = '';
            }
          });
        }
        if (document.querySelector('#city-' + shipperOrderId) !== null) {
          document.querySelector('#city-' + shipperOrderId).addEventListener('keyup', (e) => {
            if ((e.keyCode === 8 || e.which === 8) || (e.keyCode === 46 || e.which === 46)) {
              document.querySelector('#cityBackspaceCounter-' + shipperOrderId).innerHTML = parseInt(document.querySelector('#cityBackspaceCounter-' + shipperOrderId).innerHTML, 10) + 1;
              document.querySelector('#city-' + shipperOrderId).value = '';
            }
          });
        }
        if (document.querySelector('#province-' + shipperOrderId) !== null) {
          document.querySelector('#province-' + shipperOrderId).addEventListener('keyup', (e) => {
            if ((e.keyCode === 8 || e.which === 8) || (e.keyCode === 46 || e.which === 46)) {
              document.querySelector('#provinceBackspaceCounter-' + shipperOrderId).innerHTML = parseInt(document.querySelector('#provinceBackspaceCounter-' + shipperOrderId).innerHTML, 10) + 1;
              document.querySelector('#province-' + shipperOrderId).value = '';
            }
          });
        }
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

    if (this.props.shipperDetails !== undefined && !this.state.secretKey) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
      });
    }
  }

  renderService = () => {
    let options = [{
      serviceId: 0,
      value: 'select service...',
      label: 'select service...'
    }];

    _.forEach(this.props.service, (item, i) => {
      let data = {
        serviceId: item.service_id,
        value: item.service_name,
        label: item.service_name
      }
      options.push(data);
    });

    return options;
  }

  renderPickupPoint = () => {
    let options = [{
      value: 'select pickupPoint...',
      label: 'select pickupPoint...'
    }];

    _.forEach(this.props.pickupPoint, (item, i) => {
      let data = {
        value: item.pickup_point_name,
        label: item.pickup_point_name
      }
      options.push(data);
    });

    return options;
  }

  renderPaymentType = () => {
    let options = [{
      value: 'select payment type...',
      label: 'select payment type...'
    }];

    const paymentTypeList = ['prepaid', 'cod'];
    _.map(paymentTypeList, (item, i) => {
      let data = {
        value: item,
        label: item
      }
      options.push(data);
    });

    return options;
  }

  renderStores = () => {
    let toReturn = [<option key={-1} value={''}>All Stores</option>]
    _.forEach(this.props.stores, (item, i) => {
      toReturn.push(<option key={i} value={item.store_id}>{item.store_name}</option>);
    });
    return toReturn;
  }

  renderItemCategory = () => {
    let options = [{
      value: 'select item category...',
      label: 'select item category...'
    }];

    _.forEach(this.props.itemCategory, (item, i) => {
      let data = {
        value: item,
        label: item
      }
      options.push(data);
    });

    return options;
  }

  renderFilters = () => {
    let filters = null;

    if (this.props.data !== undefined) {
      filters = <div className="row">
        <div className="col-sm">
          <div className="p-4 border border-secondary rounded mb-3">
            <div className="h5 font-weight-bold"><Trans i18nKey="orders.filters" /></div>
            <div className="form-inline">
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="stores.createdFrom" /></div>
                <DatePicker
                  name="createdFrom"
                  className="form-control ml-2"
                  dateFormat="DD/MM/YY"
                  selected={this.state.createdFrom}
                  onChange={(e) => this.handleDateChange(e, "createdFrom")}
                  locale="en-gb"
                  // readOnly={true}
                />
              </div>
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="stores.modifiedFrom" /></div>
                <DatePicker
                  name="modifiedFrom"
                  className="form-control ml-2"
                  dateFormat="DD/MM/YY"
                  selected={this.state.modifiedFrom}
                  onChange={(e) => this.handleDateChange(e, "modifiedFrom")}
                  locale="en-gb"
                  todayButton={"Today"}
                  // readOnly={true}
                />
              </div>
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="orders.shipperOrderIdForFilter" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="search"
                  placeholder="e.g. ABC123,DEF456"
                  aria-label="Search"
                  name="orderId"
                  value={this.state.orderId != null ? this.state.orderId : ''}
                  onChange={(e) => this.handleOnChange(e, "orderId")}
                />
              </div>
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="stores.storeId" /></div>
                <select
                  id="storeId"
                  className="ml-2 custom-select w-50"
                  name="storeId"
                  value={this.state.storeId != null ? this.state.storeId : ''}
                  onChange={(e) => this.handleDropdownChange(e)}
                >
                  {this.renderStores()}
                </select>
              </div>
              <div className="d-flex mt-1 align-items-center mr-auto">
                <div><Trans i18nKey="stores.orderSubmitted" /></div>
                <select
                  id="isAdded"
                  className="ml-2 custom-select w-50"
                  name="isAdded"
                  value={this.state.isAdded !== null ? this.state.isAdded : ''}
                  onChange={(e) => this.handleDropdownChange(e)}
                >
                  <option value="">both</option>
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              </div>
              <div className="d-flex mt-1 align-items-center">
                <button
                  onClick={this.handleResetFilters}
                  type="button"
                  className="w-100 btn btn-secondary">
                  <Trans i18nKey="orders.resetFilters" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>;
    }

    return filters;
  }

  renderCheckBoxes = () => {
    return <div className="row">
      <div className="col-sm">
        <div className="p-4 border border-secondary rounded mb-3">
          <div className="h5 font-weight-bold"><Trans i18nKey="stores.showOrHideColumns" /></div>
          <div className="form-inline">
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="shipperOrderIdStatus"
                checked={this.state.shipperOrderIdStatus}
                onChange={(e) => this.handleOnChange(e, "shipperOrderIdStatus")}
              />
              <div><Trans i18nKey="orders.shipperOrderId" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneeNameStatus"
                checked={this.state.consigneeNameStatus}
                onChange={(e) => this.handleOnChange(e, "consigneeNameStatus")}
              />
              <div><Trans i18nKey="orders.consigneeName" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneeEmailStatus"
                checked={this.state.consigneeEmailStatus}
                onChange={(e) => this.handleOnChange(e, "consigneeEmailStatus")}
              />
              <div><Trans i18nKey="orders.consigneeEmail" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneeAddressStatus"
                checked={this.state.consigneeAddressStatus}
                onChange={(e) => this.handleOnChange(e, "consigneeAddressStatus")}
              />
              <div><Trans i18nKey="orders.consigneeAddress" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneeCountryStatus"
                checked={this.state.consigneeCountryStatus}
                onChange={(e) => this.handleOnChange(e, "consigneeCountryStatus")}
              />
              <div><Trans i18nKey="orders.consigneeCountry" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneePostalStatus"
                checked={this.state.consigneePostalStatus}
                onChange={(e) => this.handleOnChange(e, "consigneePostalStatus")}
              />
              <div><Trans i18nKey="orders.consigneePostal" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="consigneeNumberStatus"
                checked={this.state.consigneeNumberStatus}
                onChange={(e) => this.handleOnChange(e, "consigneeNumberStatus")}
              />
              <div><Trans i18nKey="orders.consigneeNumber" /></div>
            </div>
            <div className="d-flex mt-1 align-items-center mr-2">
              <input
                className="mr-2"
                type="checkbox"
                name="orderWeightStatus"
                checked={this.state.orderWeightStatus}
                onChange={(e) => this.handleOnChange(e, "orderWeightStatus")}
              />
              <div><Trans i18nKey="orders.orderWeight" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  renderPageNumbers = () => {
    const { page, showAllPageNums } = this.state;
    let pageNumberDivs = [];
    let counter = 1;
    const { totalPages } = this.props;
    const that = this;

    if (totalPages <= 10 || showAllPageNums) {
      _.times(totalPages, () => {
        pageNumberDivs.push(
          <div onClick={(e) => that.handlePageClick(e)} key={counter}>
            <li className={`page-item ${page === counter ? "border border-dark rounded" : ""}`}>
              <a className={`page-link ${page === counter ? "font-weight-bold" : ""}`}>
                {counter}
              </a>
            </li>
          </div>
        );
        counter++;
      });
    } else {
      _.times(5, () => {
        pageNumberDivs.push(
          <div onClick={(e) => that.handlePageClick(e)} key={counter}>
            <li className={`page-item ${page === counter ? "border border-dark rounded" : ""}`}>
              <a className={`page-link ${page === counter ? "font-weight-bold" : ""}`}>
                {counter}
              </a>
            </li>
          </div>
        );
        counter++;
      });
      pageNumberDivs.push(
        <div onClick={(e) => that.handleShowAllPageNums(e)} key="...">
          <li className={`page-item`}>
            <a className={`page-link`}>
              .....
            </a>
          </li>
        </div>
      );
      counter = 4;
      _.times(5, () => {
        pageNumberDivs.push(
          <div onClick={(e) => that.handlePageClick(e)} key={totalPages - counter}>
            <li className={`page-item ${page === totalPages - counter ? "border border-dark rounded" : ""}`}>
              <a className={`page-link ${page === totalPages - counter ? "font-weight-bold" : ""}`}>
                {totalPages - counter}
              </a>
            </li>
          </div>
        );
        counter--;
      });
    }

    return pageNumberDivs;
  }

  renderPagination = () => {
    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination d-flex flex-wrap mb-0">
          <li className="page-item" onClick={this.handlePreviousButton}><a className="page-link">Previous</a></li>
          {this.renderPageNumbers()}
          <li className="page-item mr-3" onClick={this.handleNextButton}><a className="page-link rounded">Next</a></li>
          <li className="page-item"><a className="page-link rounded bg-secondary text-white pointer-events-none">{this.props.totalOrders} Orders</a></li>
        </ul>
      </nav>
    )
  }

  renderStoreOrderActions() {
    return (
      <div className="mt-3">
        <Jumbotron className="p-4 border border-secondary">
          <div className="h5 font-weight-bold mt-3"><Trans i18nKey="orders.actions" /></div>
          <DropdownField fieldName='service' placeholder='select service...' labelClassName="mb-0" dropdownClassName="mb-0" disableLabel={true} onChange={(e) => this.handleServiceChange(e)} renderItems={this.renderService()} />
          <DropdownField fieldName='pickup point' placeholder='select pickup point...' labelClassName="mb-0" dropdownClassName="mb-0" disableLabel={true} onChange={(e) => this.handlePickupPointChange(e)} renderItems={this.renderPickupPoint()} />
          <DropdownField fieldName='payment type' placeholder='select payment type...' labelClassName="mb-0" dropdownClassName="mb-0" disableLabel={true} onChange={(e) => this.handlePaymentTypeChange(e)} renderItems={this.renderPaymentType()} />
          <DropdownField fieldName='item category' placeholder='select item category...' labelClassName="mb-0" dropdownClassName="mb-0" disableLabel={true} onChange={(e) => this.handleItemCategoryChange(e)} renderItems={this.renderItemCategory()} />

          {
            this.state.status === 201 ?
              <div className="alert alert-success w-100 mb-2" role="alert">
                <Trans i18nKey="stores.submitStoreOrderSuccess" />
              </div>
              :
              null
          }

          {
            this.state.status === 400 ?
              <div className="alert alert-danger w-100 mb-2" role="alert">
                <div><b><Trans i18nKey="orders.error" /></b></div>
                {this.renderErrorData()}
              </div>
              :
              null
          }

          {
            !this.state.addOrdersLoading && this.state.selectedDataList.length > 0 ?
              <button
                onClick={this.handleAddStoreOrders}
                type="button"
                className="mb-1 w-100 btn btn-success">
                <Trans i18nKey="stores.submitStoreOrders" />
              </button>
              :
              <button
                onClick={this.handleAddStoreOrders}
                type="button"
                className="mb-1 w-100 btn btn-secondary"
                disabled={true}>
                <Trans i18nKey="stores.submitStoreOrders" />
              </button>
          }
        </Jumbotron>
      </div>
    )
  }

  renderErrorData = () => {
    let errorData = [];

    if (!_.isEmpty(this.state.errorData)) {
      if (this.state.errorData.length === this.state.selectedDataList.length) {
        _.map(this.state.errorData, (item, i) => {
          const shipperOrderId = this.state.selectedDataList[i].shipper_order_id;
          errorData.push(<div key={i}>{'Order Id ' + shipperOrderId + ': ' + JSON.stringify(item)}</div>);
        });
      }
    }

    return errorData;
  }

  fetchStoreOrders() {
    this.throttledFetch.cancel();

    let {
      secretKey,
      storeId,
      orderId,
      isAdded,
      createdFrom,
      modifiedFrom
    } = this.state;

    createdFrom = createdFrom ? moment(createdFrom).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : createdFrom;
    modifiedFrom = modifiedFrom ? moment(modifiedFrom).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : modifiedFrom;

    if (orderId === '') {
      orderId = null;
    }
    this.props.fetchStoreOrderByFilter(secretKey, storeId, orderId, isAdded, createdFrom, modifiedFrom);
  }

  handleServiceChange = (e) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select service...') {
      _.map(this.props.service, (item, i) => {
        if (selectedValue === item.service_name) {
          const serviceIdValue = item.service_id;

          this.setState({
            serviceId: serviceIdValue
          });
        }
      });
    } else {
      this.setState({
        serviceId: 0
      });
    }
  }

  handlePickupPointChange = (e) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select pickupPoint...') {
      _.map(this.props.pickupPoint, (item, i) => {
        if (selectedValue === item.pickup_point_name) {
          const pickupPointAddress = item.pickup_point_address;
          const pickupPointState = item.pickup_point_state;
          const pickupPointCity = item.pickup_point_city;
          const pickupPointCountry = item.pickup_point_country;
          this.setState({
            pickupCountry: pickupPointCountry,
            pickupAddress: pickupPointAddress + ', ' + pickupPointState + ', ' + pickupPointCity + ', ' + pickupPointCountry
          });
        }
      });
    } else {
      this.setState({
        pickupCountry: '',
        pickupAddress: ''
      });
    }
  }

  handlePaymentTypeChange = (e) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select payment type...') {
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
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    const selectedValue = e.value;
    console.log(selectedValue);

    if (selectedValue !== 'select item category...') {
      this.setState({
        itemCategory: selectedValue
      });
    } else {
      this.setState({
        itemCategory: ''
      });
    }
  }

  handleDropdownChange = (e) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      loading: true,
      page: 1,
      addOrdersLoading: false
    });
    this.resetToggleSelectAll();

    let value = null;
    if (e.target.value) {
      value = e.target.value;
    }

    this.setState({ [e.target.name]: value }, () => {
      this.throttledFetch();
    });
  }

  handleDateChange = (e, fieldName) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    this.setState({
      loading: true,
      page: 1,
      addOrdersLoading: false
    });
    this.resetToggleSelectAll();

    this.setState({ [fieldName]: e }, () => {
      this.throttledFetch();
    });
  }

  toggleSelectAll = (selectedAllDataList) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    let checkboxList = document.querySelectorAll('input[type=checkbox]');
    if (!this.state.selectAll) {
      checkboxList.forEach((item) => {
        item.checked = true;
      });

      this.setState({
        selectAll: true,
        selectedDataList: selectedAllDataList,
        selectedAllDataList: selectedAllDataList
      });
    } else {
      checkboxList.forEach((item) => {
        item.checked = false;
      });

      this.setState({
        selectAll: false,
        selectedDataList: [],
        selectedAllDataList: []
      });
    }
  }

  resetToggleSelectAll = () => {
    let checkboxList = document.querySelectorAll('input[type=checkbox]');
    checkboxList.forEach((item) => {
      item.checked = false;
    });
    this.setState({
      selectAll: false,
      selectedDataList: [],
      selectedAllDataList: []
    });
  }

  handleResetFilters = () => {
    this.setState({
      storeId: null,
      orderId: null,
      isAdded: false,
      createdFrom: null,
      modifiedFrom: null,
      loading: true,
      page: 1
    }, () => { this.throttledFetch() });
    this.resetToggleSelectAll();
  }

  handleCheckboxChange = (e, value) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    let needNewValue = false;
    _.map(this.state.selectedDataList, (item, i) => {
      if (_.has(item, 'checkbox')) {
        needNewValue = true;
      }
    });

    let newValue = value;
    if (needNewValue) {
      newValue = {
        "checkbox": value
      };
    }

    const shipperOrderId = value.shipper_order_id;
    if (e.target.checked) {
      const postalCode = value.consignee_postal;
      const country = value.consignee_country;
      if (postalCode && country) {
        this.props.fetchPostalIdentifier(this.state.secretKey, postalCode, country);
        this.setState({
          selectedDataList: this.state.selectedDataList.concat(newValue),
          selectedAllDataList: this.state.selectedAllDataList.concat(newValue),
          shipperOrderIdList: this.state.shipperOrderIdList.concat(shipperOrderId)
        });
      }
    } else {
      this.setState({
        selectedDataList: this.state.selectedDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.shipper_order_id !== value.shipper_order_id;
          } else {
            return item.shipper_order_id !== value.shipper_order_id;
          }
        }),
        selectedAllDataList: this.state.selectedAllDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.shipper_order_id !== value.shipper_order_id;
          } else {
            return item.shipper_order_id !== value.shipper_order_id;
          }
        }),
        shipperOrderIdList: this.state.shipperOrderIdList.filter((item) => item !== shipperOrderId)
      });
    }
  }

  handleViewButton = (orderId, storeId) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    history.push({
      pathname: `/view-web-store-order-details/${orderId}/${storeId}`
    });
  }

  handleOnChange = (e, fieldName) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();
    this.setState({
      addOrdersLoading: false
    });

    const { name, value, checked } = e.target;
    if (fieldName === 'orderId') {
      this.setState({
        loading: true,
        page: 1
      });
      this.resetToggleSelectAll();

      this.setState({ [name]: value }, () => {
        this.throttledFetch();
      });
    } else {
      if (e.target.type === 'checkbox') {
        this.setState({ [name]: checked });
      } else {
        this.setState({ [name]: value });
      }
    }
  }

  handlePreviousButton = () => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    if (this.state.page > 1) {
      this.setState({
        loading: true
      });
      this.resetToggleSelectAll();

      this.setState({
        page: this.state.page - 1
      }, () => { this.throttledFetch() });
    }
  }

  handleNextButton = () => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    if (this.state.page < this.props.totalPages) {
      this.setState({
        loading: true
      });
      this.resetToggleSelectAll();

      this.setState({
        page: this.state.page + 1
      }, () => { this.throttledFetch() });
    }
  }

  handlePageClick = (e) => {
    this.props.clearStoreErrors();
    this.props.clearOrderErrors();

    this.setState({
      loading: true
    });
    this.resetToggleSelectAll();

    this.setState({
      page: parseInt(e.target.innerHTML, 10)
    }, () => { this.throttledFetch() });
  }

  handleShowAllPageNums = (e) => {
    this.setState({
      showAllPageNums: true,
    });
    this.resetToggleSelectAll();
  }

  handleAddStoreOrders = () => {
    let ordersList = [];

    if (_.isEqual(this.state.selectedDataList, this.state.selectedAllDataList)) {
      // add store orders selectAll
      if (this.state.selectedAllDataList.length > 0) {
        _.map(this.state.selectedAllDataList, (item, i) => {
          const isAdded = item.is_added;

          const itemsList = _.map(item.items, (item, i) => {
            return Object.assign(item, {
              'item_sku': '',
              'item_category': this.state.itemCategory
            });
          });

          if (!isAdded) {
            const ordersListData = {
              "service_id": this.state.serviceId,
              "store_id": item.store_id,
              "consignee_name": item.consignee_name,
              "consignee_number": document.querySelector('#consigneeNumber-' + item.shipper_order_id) !== null ? document.querySelector('#consigneeNumber-' + item.shipper_order_id).value : '',
              "consignee_address": item.consignee_address,
              "consignee_postal": item.consignee_postal,
              "consignee_country": item.consignee_country,
              "consignee_city": document.querySelector('#city-' + item.shipper_order_id) !== null ? document.querySelector('#city-' + item.shipper_order_id).value : '',
              "consignee_state": document.querySelector('#state-' + item.shipper_order_id) !== null ? document.querySelector('#state-' + item.shipper_order_id).value : '',
              "consignee_province": document.querySelector('#province-' + item.shipper_order_id) !== null ? document.querySelector('#province-' + item.shipper_order_id).value : '',
              "consignee_email": item.consignee_email,
              "shipper_order_id": item.shipper_order_id,
              "tracking_no": item.tracking_no,
              "order_length": document.querySelector('#length-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#length-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_width": document.querySelector('#width-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#width-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_height": document.querySelector('#height-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#height-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_weight": document.querySelector('#weight-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#weight-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "cod_amt_to_collect": document.querySelector('#cod_amt_to_collect-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#cod_amt_to_collect-' + item.shipper_order_id).value, 10).toFixed(2)) : null,
              "pickup_address": this.state.pickupAddress,
              "pickup_country": this.state.pickupCountry,
              "payment_type": this.state.paymentType,
              "items": itemsList
            };

            if (ordersListData.payment_type == 'cod' && ordersListData.cod_amt_to_collect == null && item.order_totals) {
              ordersListData.cod_amt_to_collect = item.order_totals.total
            }

            ordersList.push(ordersListData);
          }
        });

        if (ordersList.length > 0) {
          this.props.addOrders(this.state.secretKey, ordersList);
          this.setState({
            addOrdersLoading: true
          });
        }
      }
    } else {
      // add store orders checked one
      if (this.state.selectedDataList.length > 0) {
        _.map(this.state.selectedDataList, (item, i) => {
          const isAdded = item.is_added;

          const itemsList = _.map(item.items, (item, i) => {
            return Object.assign(item, {
              'item_sku': '',
              'item_category': this.state.itemCategory
            });
          });

          if (!isAdded) {
            const ordersListData = {
              "service_id": this.state.serviceId,
              "store_id": item.store_id,
              "consignee_name": item.consignee_name,
              "consignee_number": document.querySelector('#consigneeNumber-' + item.shipper_order_id) !== null ? document.querySelector('#consigneeNumber-' + item.shipper_order_id).value : '',
              "consignee_address": item.consignee_address,
              "consignee_postal": item.consignee_postal,
              "consignee_country": item.consignee_country,
              "consignee_city": document.querySelector('#city-' + item.shipper_order_id) !== null ? document.querySelector('#city-' + item.shipper_order_id).value : '',
              "consignee_state": document.querySelector('#state-' + item.shipper_order_id) !== null ? document.querySelector('#state-' + item.shipper_order_id).value : '',
              "consignee_province": document.querySelector('#province-' + item.shipper_order_id) !== null ? document.querySelector('#province-' + item.shipper_order_id).value : '',
              "consignee_email": item.consignee_email,
              "shipper_order_id": item.shipper_order_id,
              "tracking_no": item.tracking_no,
              "order_length": document.querySelector('#length-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#length-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_width": document.querySelector('#width-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#width-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_height": document.querySelector('#height-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#height-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "order_weight": document.querySelector('#weight-' + item.shipper_order_id) !== null ? parseFloat(parseFloat(document.querySelector('#weight-' + item.shipper_order_id).value, 10).toFixed(2)) : 0,
              "pickup_address": this.state.pickupAddress,
              "pickup_country": this.state.pickupCountry,
              "payment_type": this.state.paymentType,
              "items": itemsList
            };
            ordersList.push(ordersListData);
          }
        });

        if (ordersList.length > 0) {
          this.props.addOrders(this.state.secretKey, ordersList);
          this.setState({
            addOrdersLoading: true
          });
        }
      }
    }
  }

  getItemPriceTotal = order => {
    if (order.order_totals) {
      return order.order_totals.total
    }

    if (order.items) {
      const add = (a, b) => a + b
      const itemTotals = order.items.map(item => (item.item_price_value * item.item_quantity))
      return itemTotals.reduce(add, 0)
    } else {
      return 0
    }
  }

  render() {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ row, value }) => {
          const isAdded = value.is_added;
          return (
            <input
              type="checkbox"
              className="checkbox ml-3"
              //checked={}
              disabled={isAdded ? true : false}
              onChange={(e) => this.handleCheckboxChange(e, value)}
            />
          );
        },
        // Header: (row) => {
        //   const selectedAllDataList = row.data;
        // 	return (
        // 		<input
        // 			type="checkbox"
        // 			className="checkbox"
        // 			//checked={}
        // 			//ref={}
        // 			onChange={() => this.toggleSelectAll(selectedAllDataList)}
        // 		/>
        // 	);
        // },
        show: true
      },
      {
        Header: 'Shipper order id',
        accessor: 'shipper_order_id',
        show: this.state.shipperOrderIdStatus
      },
      {
        Header: 'Consignee name',
        accessor: 'consignee_name',
        show: this.state.consigneeNameStatus
      },
      {
        Header: 'Consignee email',
        accessor: 'consignee_email',
        show: this.state.consigneeEmailStatus
      },
      {
        Header: 'Consignee address',
        accessor: 'consignee_address',
        show: this.state.consigneeAddressStatus
      },
      {
        Header: 'Consignee country',
        accessor: 'consignee_country',
        show: this.state.consigneeCountryStatus
      },
      {
        Header: 'Consignee postal',
        accessor: 'consignee_postal',
        show: this.state.consigneePostalStatus
      },
      {
        Header: 'Consignee number',
        accessor: "",
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          const consigneeNumber = value.consignee_number;
          return (
            <div>
              <input
                id={'consigneeNumber-' + shipperOrderId}
                type="text"
                name="weight"
                className="form-control"
                step="any"
                disabled={isAdded ? true : false}
                defaultValue={consigneeNumber}
                onChange={(e) => this.handleOnChange(e, "consigneeNumber")}
              />
            </div>
          );
        },
        show: this.state.consigneeNumberStatus
      },
      {
        Header: 'Weight (kg)',
        accessor: "",
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          const weight = value.order_weight;
          return (
            <div>
              <input
                id={'weight-' + shipperOrderId}
                type="number"
                name="weight"
                className="form-control"
                step="any"
                disabled={isAdded ? true : false}
                defaultValue={weight}
                onChange={(e) => this.handleOnChange(e, "weight")}
              />
            </div>
          );
        },
        show: this.state.orderWeightStatus
      },
      {
        id: "input",
        Header: 'State',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <div>
              <div id={'stateBackspaceCounter-' + shipperOrderId} style={{ display: 'none' }}>0</div>
              <input
                id={'state-' + shipperOrderId}
                type="text"
                name="state"
                className="form-control"
                disabled={isAdded ? true : false}
                onChange={(e) => this.handleOnChange(e, "state")}
              />
            </div>
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'City',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <div>
              <div id={'cityBackspaceCounter-' + shipperOrderId} style={{ display: 'none' }}>0</div>
              <input
                id={'city-' + shipperOrderId}
                type="text"
                name="city"
                className="form-control"
                disabled={isAdded ? true : false}
                onChange={(e) => this.handleOnChange(e, "city")}
              />
            </div>
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'Province',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <div>
              <div id={'provinceBackspaceCounter-' + shipperOrderId} style={{ display: 'none' }}>0</div>
              <input
                id={'province-' + shipperOrderId}
                type="text"
                name="province"
                className="form-control"
                disabled={isAdded ? true : false}
                onChange={(e) => this.handleOnChange(e, "province")}
              />
            </div>
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'Width (cm)',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <input
              id={'width-' + shipperOrderId}
              type="number"
              name="width"
              className="form-control"
              step="any"
              disabled={isAdded ? true : false}
              onChange={(e) => this.handleOnChange(e, "width")}
            />
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'Height (cm)',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <input
              id={'height-' + shipperOrderId}
              type="number"
              name="height"
              className="form-control"
              step="any"
              disabled={isAdded ? true : false}
              onChange={(e) => this.handleOnChange(e, "height")}
            />
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'Length (cm)',
        accessor: "",
        width: 80,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          return (
            <input
              id={'length-' + shipperOrderId}
              type="number"
              name="length"
              className="form-control"
              step="any"
              disabled={isAdded ? true : false}
              onChange={(e) => this.handleOnChange(e, "length")}
            />
          );
        },
        show: true
      },
      {
        id: "input",
        Header: 'COD amt to collect',
        accessor: "",
        width: 120,
        Cell: ({ row, value }) => {
          const shipperOrderId = value.shipper_order_id;
          const isAdded = value.is_added;
          const orderTotal = value.order_totals ? value.order_totals.total : (this.getItemPriceTotal(value) || '')
          return (
            <input
              id={'cod_amt_to_collect-' + shipperOrderId}
              type="number"
              name="cod_amt_to_collect"
              className="form-control"
              step="any"
              defaultValue={orderTotal}
              disabled={isAdded || false}
              onChange={(e) => this.handleOnChange(e, "cod_amt_to_collect")}
            />
          );
        },
        show: this.state.paymentType == 'cod'
      },
      {
        Header: 'Order submitted',
        accessor: 'is_added',
        Cell: (props) => {
          const isAddedText = props.original.is_added.toString();
          return isAddedText;
        },
        show: true
      },
      {
        Header: 'Created on',
        accessor: 'created_on',
        Cell: (props) => {
          return moment(props.value).format('DD/MM/YY HHmm[HRS]');
        },
        show: true
      },
      {
        id: "button",
        Header: 'Action',
        accessor: "",
        width: 65,
        Cell: ({ row, value }) => {
          const orderId = value.shipper_order_id;
          const storeId = value.store_id;
          return (
            <div>
              <button type="button" className="btn btn-primary mr-1" onClick={() => this.handleViewButton(orderId, storeId)}>View</button>
            </div>
          );
        },
        show: true
      },
    ];

    _.filter(columns, (item, i) => {
      return item.show;
    });

    let renderDiv = null;
    if (this.props.data === undefined) {
      renderDiv = <div>
        <div className="mt-4 container">
          {this.renderFilters()}
        </div>
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
      renderDiv = <div className="mt-4 container">
        {this.renderFilters()}

        {this.renderCheckBoxes()}

        {
          this.state.isAdded === 'false' ?
            <div className="alert alert-info text-center w-100 mt-0 mb-3" role="alert">
              <Trans i18nKey="stores.viewWebStoreOrdersInfoAlert" />
            </div>
            :
            null
        }

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-0 mb-3" role="alert"><Trans i18nKey="stores.storeOrderListLoading" /></div>
            :
            null
        }

        {/* this.renderPagination() */}

        <ReactTable
          noDataText="No order found"
          data={this.props.data}
          columns={columns}
          defaultPageSize={50}
          minRows={5}
          showPagination={false}
          // filterable
          // defaultFilterMethod={(filter, row) =>
          //   String(row[filter.id]).toUpperCase().includes(filter.value.toUpperCase())
          // }
        />

        {/* this.renderPagination() */}

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="stores.storeOrderListLoading" /></div>
            :
            null
        }

        {this.renderStoreOrderActions()}

        <div className="mb-4" />
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, order, pickupPoint, store }) {
  return ({
    error: order.error,
    errorData: order.errorData,
    status: order.status,
    shipperDetails: shipperDetails.shipperDetails,
    service: order.service,
    pickupPoint: pickupPoint.pickupPoints,
    itemCategory: order.itemCategory,
    stores: store.stores,
    data: store.storeOrder,
    postalIdentifier: store.postalIdentifier,
    totalOrders: store.totalOrders,
    totalPages: store.totalPages,
    lastUpdated: store.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchService,
    fetchPickupPoint,
    fetchItemCategory,
    fetchPrevious,
    fetchNext,
    fetchStore,
    fetchStoreOrderByFilter,
    fetchPostalIdentifier,
    addOrders,
    clearOrderErrors,
    clearStoreErrors
  }),
  withNamespaces('common')
)(ViewStoreOrders);
