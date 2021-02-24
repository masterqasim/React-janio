import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import ReactTable from "react-table";
import "react-table/react-table.css";
import _ from 'lodash';
import axios from 'axios';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';
import { DatePicker } from 'antd';
import { history } from "../../utils/historyUtils";
import queryString from 'query-string'


import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchAllCountries,
  fetchService,
  fetchStatuses,
  fetchUploadBatchNo,
  fetchPrevious,
  fetchNext,
  fetchOrderByFilter,
  deleteOrder,
  clearOrderErrors
} from '../../actions/orderActions';
import {ROOT_URL} from '../../actions/index';

import twoGoExpressLogo from '../../images/twoGoExpress.svg';
import stickerLogo from '../../images/janio-sticker-logo.svg';

// import DropdownField from '../common/DropdownField';
import SelectServices from "./SelectServices";

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
});

const { RangePicker } = DatePicker;

class ViewOrders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: true,
      fetched: false,
      assigned: false,
      fetchedOrders: false,

      urlParamsList: [],
      dataObj: {},
      secretKey: '',
      serviceId: 0,
      servicePlaceholder: this.props.t('common.allServices'),
      serviceValue: null,
      clearValue: null,
      fromDate: null,
      toDate: moment().endOf('day'),
      pickupDateFrom: null,
      pickupDateTo: null,
      pickupDate: null,
      trackingNo: '',
      shipperOrderId: '',
      statusCode: '',
      uploadBatchNo: '',
      pickupCountry: '',
      consigneeCountry: '',
      consigneeName: '',
      phoneNumber: '',

      shipperOrderIdStatus: true,
      trackingNoStatus: true,
      statusCodeStatus: true,
      createdOnStatus: true,
      consigneeNameStatus: false,
      pickupCountryStatus: false,
      consigneeCountryStatus: false,
      consigneeAddressStatus: false,
      consigneeCustomsDocuments: false,
      phoneNumberStatus: true,
      uploadBatchNoStatus: false,
      isProcessing: false,
      pickupDateStatus: false,

      selectAll: false,
      page: 1,
      pageSize: 50,
      selectedDataList: [],
      selectedAllDataList: [],
      lastUpdated: moment(),
      loading: false,
      showAllPageNums: false,
      printingOrder: [],
      isPrinting: false,

      // New States to eliminate filter-refresh bug
      queryId: 0,
      data: undefined,
      totalOrders: undefined,
      totalPages: undefined,
      selectedService: null
    };

    this.debouncedFetch = _.debounce(this.fetchOrders, 1000);
  }

  componentDidMount() {
    const location = window.location.search
    const queries = queryString.parse(location)
    const shipperOrderIds = queries['ids[]'] || queries.ids || queries.id
    const ids = shipperOrderIds instanceof Array ? shipperOrderIds.join():shipperOrderIds

    if (ids) {
      queries.shipperOrderId = ids
    }
    console.log('queries', queries)
    if (Object.keys(queries).length) {
      this.setState(queries)
    }

    this.props.fetchShipperDetails();
    if (this.props.statuses === undefined) {
      this.props.fetchStatuses();
    }
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentDidUpdate() {
    if (this.state.secretKey && !this.state.fetchedOrders) {
      this.props.fetchUploadBatchNo(this.state.secretKey);
      this.fetchOrders();
      this.setState({
        fetchedOrders: true
      });
    }

    // Check if the query is the latest query, then update this.state.data with the latest data from latest query, change loading to false, and take care of paginations
    if (this.props.queryId === this.state.queryId && this.props.data !== this.state.data){
      console.log(this.state.data)
      console.log(this.props.data)
      this.setState({
        data: this.props.data,
        loading: false,
        totalOrders: this.props.totalOrders,
        totalPages: this.props.totalPages
      })
    }
    //////

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.service === undefined && this.state.secretKey.length > 0 && !this.state.fetched) {
      this.props.fetchService(this.state.secretKey);
      this.setState({
        fetched: true
      });
    }

    if (this.props.service !== undefined && !this.state.assigned) {
      if (this.state.serviceId) {
        const service = this.props.service.filter(s => parseInt(s.service_id) === parseInt(this.state.serviceId))[0]
        this.setState({
          selectedService: {
            label: service.service_name,
            value: service.service_id,
            serviceId: service.service_id
          },
          servicePlaceholder: service.service_name,
          assigned: true
        });
      }
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

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
      });
    }
  }

  renderStatuses = () => {
    let toReturn = [<option key={-1} value={''}>{this.props.t('common.allStatuses')}</option>]

    _.forEach(this.props.statuses, (item, i) => {
      toReturn.push(<option key={i} value={item}>{item}</option>);
    });

    return toReturn;
  }

  renderCountries = () => {
    let option = [<option key={-1} value={''}>{this.props.t('common.allCountries')}</option>];

    _.map(this.props.countries, (item, i) => {
      option.push(<option key={i} value={item}>{item}</option>);
    });

    return option;
  }

  renderUploadBatchNo = () => {
    let toReturn = [<option key={-1} value={''}>{this.props.t('orders.allUploadBatchNo')}</option>];

    _.forEach(this.props.uploadBatchNo, (item, i) => {
      toReturn.push(<option key={i} value={item}>{item}</option>);
    });

    return toReturn;
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
      <nav aria-label="Page navigation example" className="d-flex align-items-center justify-content-between my-2">
        <ul className="pagination d-flex flex-wrap mb-0">
          <li className="page-item" onClick={this.handlePreviousButton}><a className="page-link">Previous</a></li>
          {this.renderPageNumbers()}
          <li className="page-item mr-3" onClick={this.handleNextButton}><a className="page-link rounded">Next</a></li>
          <li className="page-item"><a className="page-link rounded bg-secondary text-white pointer-events-none">{this.state.totalOrders} Orders</a></li>
        </ul>

        <div>
          <span><Trans i18nKey='orders.ordersPerPage' />: </span>
          <select className="custom-select" name="pageSize" id="pageSize" value={this.state.pageSize} onChange={e => {
            this.props.clearOrderErrors();

            this.setState({
              loading: true
            });
            this.resetToggleSelectAll();

            this.setState({
              pageSize: parseInt(e.target.value, 10)
            }, () => { this.debouncedFetch() });
          }}>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </nav>
    )
  }

  renderFilters = () => {
    return (
      <div className="row">
        <div className="col-sm">
          <Jumbotron className="p-4 border border-secondary">
            {
              this.state.secretKey.length === 0 && this.props.data === undefined
                ?
                null
                :
                <div>
                  <div className="h5 mt-3 font-weight-bold"><Trans i18nKey='orders.filters' /></div>
                  <div className="form-inline">
                    <SelectServices
                      serviceValue={this.state.selectedService}
                      clearValue={this.state.clearValue}
                      onChange={(e) => this.handleDropdownChange(e, 'serviceId')} />
                  </div>
                  <div className="form-inline">
                    <div className="d-flex mt-1 align-items-center mr-2">
                      
                    <div><Trans i18nKey='orders.fromDate' /></div>
                      <DatePicker
                        name="fromDate"
                        className="form-control ml-2"
                        format="DD-MM-YY"
                        // selected={this.state.fromDate !== null ? moment(this.state.fromDate) : null}
                        onChange={(e) => this.handleDateChange(e, "fromDate")}
                        locale="en-gb"
                        value={this.state.fromDate !== null ? moment(this.state.fromDate) : null}
                        // readOnly={true}
                      />
                    </div>

                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.toDate' /></div>
                      <DatePicker
                        name="toDate"
                        className="form-control ml-2"
                        format="DD-MM-YY"
                        defaultValue={moment(this.state.toDate)}
                        // selected={this.state.toDate !== null ? moment(this.state.toDate) : null}
                        onChange={(e) => this.handleDateChange(e, "toDate")}
                        locale="en-gb"
                        todayButton={"Today"}
                        // readOnly={true}
                      />
                    </div>

                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.pickupDate' /></div>
                      <RangePicker
                        name="pickupDate"
                        className="form-control ml-2"
                        // defaultValue={[!this.state.pickupDateFrom || moment(this.state.pickupDateFrom), moment(this.state.pickupDateTo)]}
                        // defaultValue={[moment(this.state.pickupDateFrom), moment(this.state.pickupDateTo)]}
                        format="DD-MM-YY"
                        onChange={this.handleDateRangeChange}
                        ranges={{
                          Today: [moment(), moment()],
                          'This Month': [moment().startOf('month'), moment().endOf('month')],
                        }}
                        value={[this.state.pickupDateFrom ? moment(this.state.pickupDateFrom) : null, this.state.pickupDateTo ? moment(this.state.pickupDateTo) : null]}
                      />
                    </div>

                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.trackingNos' /></div>
                      <input
                        className="form-control ml-2 mr-sm-2"
                        type="search"
                        placeholder="e.g. ABC123,DEF456"
                        aria-label="Search"
                        name="trackingNo"
                        value={this.state.trackingNo}
                        onChange={(e) => this.handleOnChange(e)}
                      />
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div>Consignee Name</div>
                      <input
                        className="form-control ml-2 mr-sm-2"
                        type="search"
                        placeholder="Enter consignee name"
                        aria-label="Search"
                        name="consigneeName"
                        value={this.state.consigneeName}
                        onChange={(e) => this.handleOnChange(e)}
                      />
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div>Phone Number</div>
                      <input
                        className="form-control ml-2 mr-sm-2"
                        type="search"
                        placeholder="e.g. 123456"
                        aria-label="Search"
                        name="phoneNumber"
                        value={this.state.phoneNumber}
                        onChange={(e) => this.handleOnChange(e)}
                      />
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.shipperOrderIdForFilter' /></div>
                      <input
                        className="form-control ml-2 mr-sm-2"
                        type="search"
                        placeholder={this.props.t('orders.enterShipperOrderId')}
                        aria-label="Search"
                        name="shipperOrderId"
                        value={this.state.shipperOrderId}
                        onChange={(e) => this.handleOnChange(e)}
                      />
                    </div>
                    <div className="d-flex mt-1 align-items-center">
                      <div><Trans i18nKey='orders.uploadBatchNo' /></div>
                      <select
                        id="uploadBatchNo"
                        className="ml-2 custom-select w-50"
                        name="uploadBatchNo"
                        value={this.state.uploadBatchNo != null ? this.state.uploadBatchNo : ''}
                        onChange={(e) => this.handleUploadBatchNoChange(e)}
                      >
                        {this.renderUploadBatchNo()}
                      </select>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.pickupCountry' /></div>
                      <select
                        id="pickupCountry"
                        className="ml-2 custom-select w-50"
                        name="pickupCountry"
                        value={this.state.pickupCountry != null ? this.state.pickupCountry : ''}
                        onChange={(e) => this.handlePickupCountryChange(e)}
                      >
                        {this.renderCountries()}
                      </select>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.consigneeCountry' /></div>
                      <select
                        id="consigneeCountry"
                        className="ml-2 custom-select w-50"
                        name="consigneeCountry"
                        value={this.state.consigneeCountry != null ? this.state.consigneeCountry : ''}
                        onChange={(e) => this.handleConsigneeCountryChange(e)}
                      >
                        {this.renderCountries()}
                      </select>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <div><Trans i18nKey='orders.statusCode' /></div>
                      <select
                        id="statusCode"
                        className="ml-2 custom-select w-50"
                        name="statusCode"
                        value={(this.state.statusCode || '')}
                        onChange={(e) => this.handleStatusCodeChange(e)}
                      >
                        {this.renderStatuses()}
                      </select>
                    </div>
                    {/* <div className="d-flex mt-1 align-items-center mr-auto">
                      <input type="checkbox" name="isProcessing" id="isProcessing"
                        onChange={this.handleCheckboxFilter} checked={(!!this.state.isProcessing)} />
                      <label htmlFor='isProcessing' className='ml-2'>
                        <Trans i18nKey='orders.isProcessing' />
                      </label>
                    </div> */}
                    <div className="d-flex mt-1 align-items-center">
                      <button
                        onClick={this.handleResetFilters}
                        type="button"
                        className="w-100 btn btn-secondary">
                        <Trans i18nKey='orders.resetFilters' />
                      </button>
                    </div>
                  </div>
                  <div className="h5 mt-3 font-weight-bold"><Trans i18nKey="stores.showOrHideColumns" /></div>
                  <div className="form-inline">
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="shipperOrderIdStatus"
                        checked={this.state.shipperOrderIdStatus}
                        onChange={(e) => this.handleOnChange(e, "shipperOrderIdStatus")}
                      />
                      <div><Trans i18nKey="orders.shipperOrderIdCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="trackingNoStatus"
                        checked={this.state.trackingNoStatus}
                        onChange={(e) => this.handleOnChange(e, "trackingNoStatus")}
                      />
                      <div><Trans i18nKey="orders.trackingNoCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="statusCodeStatus"
                        checked={this.state.statusCodeStatus}
                        onChange={(e) => this.handleOnChange(e, "statusCodeStatus")}
                      />
                      <div><Trans i18nKey="orders.statusCodeCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="createdOnStatus"
                        checked={this.state.createdOnStatus}
                        onChange={(e) => this.handleOnChange(e, "createdOnStatus")}
                      />
                      <div><Trans i18nKey="orders.createdOnCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="consigneeNameStatus"
                        checked={this.state.consigneeNameStatus}
                        onChange={(e) => this.handleOnChange(e, "consigneeNameStatus")}
                      />
                      <div><Trans i18nKey="orders.consigneeNameCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="pickupCountryStatus"
                        checked={this.state.pickupCountryStatus}
                        onChange={(e) => this.handleOnChange(e, "pickupCountryStatus")}
                      />
                      <div><Trans i18nKey="orders.pickupCountryCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="consigneeCountryStatus"
                        checked={this.state.consigneeCountryStatus}
                        onChange={(e) => this.handleOnChange(e, "consigneeCountryStatus")}
                      />
                      <div><Trans i18nKey="orders.consigneeCountryCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="consigneeAddressStatus"
                        checked={this.state.consigneeAddressStatus}
                        onChange={(e) => this.handleOnChange(e, "consigneeAddressStatus")}
                      />
                      <div><Trans i18nKey="orders.consigneeAddressCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="uploadBatchNoStatus"
                        checked={this.state.uploadBatchNoStatus}
                        onChange={(e) => this.handleOnChange(e, "uploadBatchNoStatus")}
                      />
                      <div><Trans i18nKey="orders.uploadBatchNoCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="consigneeCustomsDocuments"
                        checked={this.state.consigneeCustomsDocuments}
                        onChange={(e) => this.handleOnChange(e, "consigneeCustomsDocuments")}
                      />
                      <div><Trans i18nKey="orders.consigneeCustomDocumentCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="phoneNumberStatus"
                        checked={this.state.phoneNumberStatus}
                        onChange={(e) => this.handleOnChange(e, "phoneNumberStatus")}
                      />
                      <div><Trans i18nKey="orders.phoneNumberCheckbox" /></div>
                    </div>
                    <div className="d-flex mt-1 align-items-center mr-2">
                      <input
                        className="mr-2"
                        type="checkbox"
                        name="pickupDateStatus"
                        checked={this.state.pickpDateStatus}
                        onChange={(e) => this.handleOnChange(e, "pickupDateStatus")}
                      />
                      <div><Trans i18nKey="orders.pickupDateCheckbox" /></div>
                    </div>
                  </div>
                </div>
            }
          </Jumbotron>
        </div>
      </div>
    )
  }

  renderOrderActions() {
    return (
      <div className="mt-3">
        {
          this.state.error !== undefined && this.state.error !== null ?
            <div className={`alert ${this.state.error ? "alert-danger" : "alert-success"}`} role="alert">
              {this.props.message}
            </div>
            :
            null
        }

        <Jumbotron className="p-4 border border-secondary">
          <div className="h5 font-weight-bold mt-3"><Trans i18nKey="orders.actions" /></div>
          {/*<button
          onClick={this.handleDeleteTickedOrders}
          type="button"
          className={`mb-1 w-100 btn ${this.state.selectedDataList.length > 0 ? "btn-danger" : "btn-secondary"}`}
          disabled={this.state.selectedDataList.length > 0 ? false : true}>
          Delete ticked orders
          </button>*/}

          {this.renderPrintButton()}
        </Jumbotron>
      </div>
    )
  }

  renderPrintButton = () => {
    let printButtonDisabled = !!this.state.isPrinting
    let enablePrintButtons = !this.state.selectedDataList.some(o => o.is_processing);
    const printButtons = enablePrintButtons && !!this.state.selectedDataList.length ?
      <div>
        <button
          onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}
          type="button"
          className="mb-1 w-100 btn btn-success"
          disabled={printButtonDisabled}>
          <Trans i18nKey="orders.printSelectedOrdersStickersAndCommercialInvoice" />
        </button>
      </div>:
      <div>
        <button
          onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}
          type="button"
          className="mb-1 w-100 btn btn-secondary"
          disabled={true}>
          <Trans i18nKey="orders.printSelectedOrdersStickersAndCommercialInvoice" />
        </button>
      </div>;

    return printButtons;
  }

  renderFixedBottomButton = () => {
    let printButtonDisabled = !!this.state.isPrinting
    let button = null;

    let enablePrintButtons = !this.state.selectedDataList.some(o => o.is_processing);

    if (this.state.selectedAllDataList.length > 0) {
      if (enablePrintButtons) {
        if (window.innerWidth > 300 && window.innerWidth < 1000) {
          button = <div className="text-center fixed-bottom mb-2">
            <button
              type="button"
              className="btn btn-info"
              onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}
              disabled={printButtonDisabled}>
              <Trans i18nKey="orders.printLabels" />
            </button>
            <button
              type="button"
              className="btn btn-info ml-2"
              onClick={this.handleOpenMultipleTrackingNo}>
              <Trans i18nKey="orders.trackOrders" />
            </button>
          </div>;
        } else if (window.innerWidth > 1000) {
          button = <div>
            <button
              type="button"
              className="btn btn-info"
              style={{ position: 'absolute', left: '50%', right: '50%', bottom: '2%' }}
              onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}
              disabled={printButtonDisabled}>
              <Trans i18nKey="orders.printLabels" />
            </button>
            <button
              type="button"
              className="btn btn-info"
              style={{ position: 'absolute', left: '60%', right: '50%', bottom: '2%' }}
              onClick={this.handleOpenMultipleTrackingNo}>
              <Trans i18nKey="orders.trackOrders" />
            </button>
          </div>;
        }
      } else {
        if (window.innerWidth > 300 && window.innerWidth < 1000) {
          button = <div className="text-center fixed-bottom mb-2">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={true}
              onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}>
              <Trans i18nKey="orders.printLabels" />
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-2"
              disabled={true}
              onClick={this.handleOpenMultipleTrackingNo}>
              <Trans i18nKey="orders.trackOrders" />
            </button>
          </div>;
        } else if (window.innerWidth > 1000) {
          button = <div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={true}
              style={{ position: 'absolute', left: '50%', right: '50%', bottom: '2%' }}
              onClick={this.handlePrintSelectedOrdersStickersAndCommercialInvoice}>
              <Trans i18nKey="orders.printLabels" />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={true}
              style={{ position: 'absolute', left: '60%', right: '50%', bottom: '2%' }}
              onClick={this.handleOpenMultipleTrackingNo}>
              <Trans i18nKey="orders.trackOrders" />
            </button>
          </div>;
        }
      }
    }

    return button;
  }

  renderPartnerLogo = () => {
    let partnerLogoImgs = [];
    let partnerLogoImgStr = [];

    if (this.props.data !== undefined) {
      const partnerLogoUrlsList = _.map(this.props.data, (item, i) => {
        return item.partner_logo_urls;
      });
      _.map(partnerLogoUrlsList, (item, i) => {
        _.map(item, (value, i) => {
          if (!_.includes(partnerLogoImgStr, value)) {
            partnerLogoImgStr.push(value);
          }
        });
      });

      _.map(partnerLogoImgStr, (item, i) => {
        const index = i + 1;
        partnerLogoImgs.push(<img key={i} id={'partnerLogo' + index} crossOrigin="Anonymous" alt="" src={item} style={{ display: 'none' }} />);
      });
    }

    return partnerLogoImgs;
  }

  fetchOrders() {
    let {
      secretKey,
      serviceId,
      trackingNo,
      shipperOrderId,
      statusCode,
      uploadBatchNo,
      pickupCountry,
      consigneeCountry,
      consigneeName,
      phoneNumber,
      fromDate,
      toDate,
      pickupDateFrom,
      pickupDateTo,
      isProcessing,
      page,
      pageSize,
      queryId
    } = this.state;

    fromDate = fromDate ? moment(fromDate).startOf('day').format() : fromDate;
    toDate = toDate ? moment(toDate).endOf('day').format() : toDate;

    // Increase QueryId by 1 for each fetchOrders call and update the state
    queryId += 1
    this.setState({
      queryId: queryId
    })

    this.props.fetchOrderByFilter(secretKey, serviceId, trackingNo,
      shipperOrderId, statusCode, uploadBatchNo,
      pickupCountry, consigneeCountry, fromDate,
      toDate, isProcessing, page, pageSize, queryId, consigneeName, phoneNumber, pickupDateFrom, pickupDateTo);
  }

  handleDropdownChange = (e, type) => {
    this.props.clearOrderErrors();
    this.setState({
      loading: true,
      page: 1,
      clearValue: null
    });
    this.resetToggleSelectAll();

    let value = e.serviceId;
    if (value !== undefined) {
      value = e.serviceId;
    } else {
      value = 0;
    }

    if (type === 'serviceId') {
      const secretKey = this.props.shipperDetails.agent_application_secret_key;
      const selectedServiceId = parseInt(value, 10);

      const location = window.location.search
      const queries = queryString.parse(location)

      if (!value) {
        delete queries.serviceId
      } else {
        queries.serviceId = value
      }
      const stringified = queryString.stringify(queries)
      const url = `${window.location.pathname}?${stringified}`
      window.history.pushState({}, '', url);

      this.setState({
        secretKey: secretKey,
        serviceId: selectedServiceId,
        selectedService: e
      }, () => {
        this.debouncedFetch();
      });
    }
  }

  handleUploadBatchNoChange = (e) => {
    this.changePathFunc(e);
  }

  handleStatusCodeChange = (e) => {
    this.changePathFunc(e);
  }

  handlePickupCountryChange = (e) => {
    this.changePathFunc(e);
  }

  handleConsigneeCountryChange = (e) => {
    this.changePathFunc(e);
  }

  changePathFunc = (e) => {
    this.props.clearOrderErrors();
    this.setState({
      loading: true,
      page: 1
    });
    this.resetToggleSelectAll();

    const { name, value } = e.target;

    const location = window.location.search
    const queries = queryString.parse(location)

    if (!value) {
      delete queries[name]
    } else {
      queries[name] = value
    }
    const stringified = queryString.stringify(queries)
    const url = `${window.location.pathname}?${stringified}`
    window.history.pushState({}, '', url);
    this.setState({ [name]: value }, () => {
      this.debouncedFetch();
    });
  }

  handleDateChange = (e, fieldName) => {
    this.props.clearOrderErrors();

    this.setState({
      loading: true,
      page: 1
    });
    this.resetToggleSelectAll();

    if (fieldName === 'fromDate') {
      e = e ? moment(e).startOf('day').format() : e
    } else if (fieldName === 'toDate') {
      e = e ? moment(e).endOf('day').format() : e
    }

    const location = window.location.search
    let queries = queryString.parse(location)
    if (e) {
      queries[fieldName] = e
    } else {
      delete queries[fieldName]
    }

    const stringified = queryString.stringify(queries)
    const url = `${window.location.pathname}?${stringified}`
    window.history.pushState({}, '', url);

    this.setState({ [fieldName]: e }, () => {
      this.debouncedFetch();
    });
  }


  handleDateRangeChange = (date) => {
    console.log('date ----- ', date)
    this.props.clearOrderErrors();

    this.setState({
      loading: true,
      page: 1
    });

    this.resetToggleSelectAll();

    this.setState({ pickupDateFrom: date[0].format('YYYY-MM-DD'), pickupDateTo: date[1].format('YYYY-MM-DD') }, () => {
      const location = window.location.search
      let queries = queryString.parse(location)
      queries['pickupDateFrom'] = this.state.pickupDateFrom
      queries['pickupDateTo'] = this.state.pickupDateTo


      const stringified = queryString.stringify(queries)
      const url = `${window.location.pathname}?${stringified}`
      window.history.pushState({}, '', url);
      this.debouncedFetch();
    })
    
  }



  toggleSelectAll = (selectedAllDataList) => {
    this.props.clearOrderErrors();

    const checkboxList = document.querySelectorAll('input[type=checkbox]');
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
    const checkboxList = document.querySelectorAll('input[type=checkbox]');
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
      serviceId: 0,
      servicePlaceholder: this.props.t('common.allServices'),
      clearValue: true,
      fromDate: null,
      pickupDate: null,
      pickupDateFrom: null,
      pickupDateTo: null,
      trackingNo: '',
      shipperOrderId: '',
      statusCode: '',
      uploadBatchNo: '',
      pickupCountry: '',
      consigneeCountry: '',
      phoneNumber: '',
      consigneeName: '',
      loading: true,
      page: 1
    }, () => { this.debouncedFetch() });
    this.resetToggleSelectAll();
  }

  handleCheckboxChange = (e, value) => {
    this.props.clearOrderErrors();

    if (e.target.checked) {
      this.setState({
        selectedDataList: this.state.selectedDataList.concat(value),
        selectedAllDataList: this.state.selectedAllDataList.concat(value)
      });
    } else {
      this.setState({
        selectedDataList: this.state.selectedDataList.filter((item) => item.order_id !== value.order_id),
        selectedAllDataList: this.state.selectedAllDataList.filter((item) => item.order_id !== value.order_id)
      });
    }
  }

  handleViewButton = (orderId) => {
    this.props.clearOrderErrors();

    history.push({
      pathname: `/view-order-details/${orderId}`
    });
  }

  handleTrackButton = (trackingNo) => {
    window.open(`https://tracker.janio.asia/${trackingNo}`);
  }

  // method to generate pdf labels
  generateLabels = (payload) => {

    // set loading states for printing of individual and multiple orders
    if (payload.tracking_nos.length > 1){
      this.setState({isPrinting: true})
    }else{
      let newPrinting = [...this.state.printingOrder]
      newPrinting.push(payload.tracking_nos[0])
      this.setState({printingOrder: newPrinting})
    }

    axios.post(`${ROOT_URL}/label/generate-label-invoice/`,
      payload,
        {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then((response) => {
          const filename = response.headers['content-disposition'].split(';')[1].trim().substring(9)
          const external_urls = response.headers['external-labels'].replace(/ /g,'').split(',')
          console.log(filename)
          console.log(external_urls)
          const url = URL.createObjectURL(new Blob([response.data], {type:"application/pdf"}));
          window.open(url);

          if (external_urls[0]){
            external_urls.forEach(element => {
              window.open(element)
            });
          }

          console.log(response)

          // reset loading states for printing of individual and multiple orders
          if (this.state.isPrinting === true){
            this.setState({isPrinting: false})
          }else{
            let newPrinting = [...this.state.printingOrder]
            _.remove(newPrinting, (item) => (item === payload.tracking_nos[0]))
            this.setState({printingOrder: newPrinting})
          }
        })
        .catch(error => {
          var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.response.data));
          var obj = JSON.parse(decodedString);
          console.log(obj)

          if (obj['message']){
            console.log(obj['message'])
          }else {
            console.log('Unable to generate labels, please check your tracking numbers and date format.')
          }

          // reset loading states for printing of individual and multiple orders
          if (this.state.isPrinting === true){
            this.setState({isPrinting: false})
          }else{
            let newPrinting = [...this.state.printingOrder]
            _.remove(newPrinting, (item) => (item === payload.tracking_nos[0]))
            this.setState({printingOrder: newPrinting})
          }
        });
  };
  
  // method to merge olus into one file
  mergeLabels = (payload) => {
    this.setState({isPrinting: true})
    axios.post(ROOT_URL + "/label/merge-olu/",
      payload,
        {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], {type:"application/pdf"}));
          this.setState({pdfURL: url})
          window.open(url)

          this.setState({isPrinting: false})
          console.log(response)
        })
        .catch(error => {
          this.setState({isPrinting: false})
          var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.response.data));
          var obj = JSON.parse(decodedString);
          console.log(obj)

          if (obj['message']){
            this.setState({errorMessage: obj['message']})
          }else {
            this.setState({errorMessage: 'Unable to generate labels, please check your tracking numbers and date format.'})
          }
        });
  };

  handlePrintButton = (value) => {
    let payload = {
      tracking_nos: [value.tracking_no],
      password: 'JanioLabel123!'
    }

    if (value.order_label_url){
      window.open(value.order_label_url+'.pdf')
    }else{
      this.generateLabels(payload)
    }
  }

  handleDeleteButton = (orderId) => {
    this.props.clearOrderErrors();
    if (this.state.secretKey.length > 0) {
      this.props.deleteOrder(orderId, this.state.secretKey);
    }
  }

  handleDeleteTickedOrders = () => {
    this.props.clearOrderErrors();

    if (_.isEqual(this.state.selectedDataList, this.state.selectedAllDataList)) {
      // delete selectAll
      if (this.state.selectedAllDataList.length > 0) {
        let itemList = _.map(this.state.selectedAllDataList, (item, i) => {
          return item.checkbox;
        });

        _.map(itemList, (item, i) => {
          let orderId = item.order_id;
          if (this.state.secretKey.length > 0) {
            this.props.deleteOrder(orderId, this.state.secretKey);
          }
        });
      }
    } else {
      // delete checked one
      if (this.state.selectedDataList.length > 0) {
        _.map(this.state.selectedDataList, (item, i) => {
          let orderId = item.order_id;
          if (this.state.secretKey.length > 0) {
            this.props.deleteOrder(orderId, this.state.secretKey);
          }
        });
      }
    }
  }

  handlePrintSelectedOrdersStickersAndCommercialInvoice = () => {
    this.props.clearOrderErrors();

    if (_.isEqual(this.state.selectedDataList, this.state.selectedAllDataList)) {
      // generate both pdf selectAll
      if (this.state.selectedAllDataList.length > 0) {
        const itemList = _.map(this.state.selectedAllDataList, (item, i) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox;
          } else {
            return item;
          }
        });

        const result = itemList.reduce((result, curr, index, arr)=>{
          if (!curr.order_label_url){
            result.has_olu = false
          }
          result.olus.push(curr.order_label_url)
          result.tracking_nos.push(curr.tracking_no)
          return result
        },{has_olu: true, olus:[], tracking_nos:[]})

        if (result.has_olu){
          this.mergeLabels({olus:result.olus})
        }else{
          this.generateLabels({tracking_nos:result.tracking_nos, password: 'JanioLabel123!'})
        }
      }
    } else {
      // generate both pdf checked one
      if (this.state.selectedDataList.length > 0) {
        const itemList = _.map(this.state.selectedDataList, (item, i) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox;
          } else {
            return item;
          }
        });
        const result = itemList.reduce((result, curr, index, arr)=>{
          if (!curr.order_label_url){
            result.has_olu = false
          }
          result.olus.push(curr.order_label_url)
          result.tracking_nos.push(curr.tracking_no)
          return result
        },{has_olu: true, olus:[], tracking_nos:[]})

        if (result.has_olu){
          this.mergeLabels({olus:result.olus})
        }else{
          this.generateLabels({tracking_nos:result.tracking_nos, password: 'JanioLabel123!'})
        }
      }
    }
  }

  handleOpenMultipleTrackingNo = () => {
    this.props.clearOrderErrors();

    if (_.isEqual(this.state.selectedDataList, this.state.selectedAllDataList)) {
      // selectAll
      if (this.state.selectedAllDataList.length > 0) {
        const itemList = _.map(this.state.selectedAllDataList, (item, i) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox;
          } else {
            return item;
          }
        });

        let trackingNo = '';
        _.map(itemList, (item, i) => {
          if (i !== itemList.length - 1) {
            trackingNo += item.tracking_no + ',';
          } else {
            trackingNo += item.tracking_no;
          }
        });

        const url = window.location.href;
        if (url.includes('janio-shipper.herokuapp.com') || url.includes('merchant.janio.asia')) {
          window.open(`https://tracker.janio.asia/${trackingNo}`);
        } else if (url.includes('janio-shipper-int.herokuapp.com')) {
          window.open(`https://janio-tracker-int.herokuapp.com/${trackingNo}`);
        } else {
          window.open(`https://janio-tracker-demo.herokuapp.com/${trackingNo}`);
        }
      }
    } else {
      // checked one
      if (this.state.selectedDataList.length > 0) {
        let trackingNo = '';
        _.map(this.state.selectedDataList, (item, i) => {
          if (i !== this.state.selectedDataList.length - 1) {
            trackingNo += item.tracking_no + ',';
          } else {
            trackingNo += item.tracking_no;
          }
        });

        const url = window.location.href;
        if (url.includes('janio-shipper.herokuapp.com') || url.includes('merchant.janio.asia')) {
          window.open(`https://tracker.janio.asia/${trackingNo}`);
        } else if (url.includes('janio-shipper-int.herokuapp.com')) {
          window.open(`https://janio-tracker-int.herokuapp.com/${trackingNo}`);
        } else {
          window.open(`https://janio-tracker-demo.herokuapp.com/${trackingNo}`);
        }
      }
    }
  }

  generatePdf = (doc) => {
    let blob = null;
    if (doc !== null) {
      if (!_.isArray(doc)) {
        blob = doc.output("blob");
      } else {
        blob = doc[0].output("blob");
      }

      window.open(URL.createObjectURL(blob));
    }
  }

  handleOnChange = (e) => {
    this.props.clearOrderErrors();

    const { name, value, checked } = e.target;
    if (e.target.type === 'checkbox') {
      this.setState({ [name]: checked });
    } else {
      this.setState({
        loading: true,
        page: 1
      });
      this.resetToggleSelectAll();

      let newDataObj = {};
      newDataObj[name] = value;

      const location = window.location.search
      let queries = queryString.parse(location)
      if (value) {
        queries[name] = value.match(/[A-Za-z0-9-]+/g).join(',')
      } else {
        delete queries[name]
        if (name === 'shipperOrderId') {
          delete queries['ids[]']
        }
      }

      const stringified = queryString.stringify(queries)
      const url = `${window.location.pathname}?${stringified}`
      window.history.pushState({}, '', url);

      this.setState({ [name]: value }, () => {
        this.debouncedFetch();
      });
    }
  }

  handlePreviousButton = () => {
    this.props.clearOrderErrors();

    if (this.state.page > 1) {
      this.setState({
        loading: true
      });
      this.resetToggleSelectAll();

      this.setState({
        page: this.state.page - 1
      }, () => { this.debouncedFetch() });
    }
  }

  handleNextButton = () => {
    this.props.clearOrderErrors();

    if (this.state.page < this.props.totalPages) {
      this.setState({
        loading: true
      });
      this.resetToggleSelectAll();

      this.setState({
        page: this.state.page + 1
      }, () => { this.debouncedFetch() });
    }
  }

  handlePageClick = (e) => {
    this.props.clearOrderErrors();

    this.setState({
      loading: true
    });
    this.resetToggleSelectAll();

    this.setState({
      page: parseInt(e.target.innerHTML, 10)
    }, () => { this.debouncedFetch() });
  }

  handleShowAllPageNums = (e) => {
    this.setState({
      showAllPageNums: true,
    });
    this.resetToggleSelectAll();
  }

  handleCheckboxFilter = e => {
    const {name, checked} = e.target

    this.setState({
      loading: true,
      page: 1
    });
    this.resetToggleSelectAll();

    let newDataObj = {};
    newDataObj[name] = checked;

    const location = window.location.search
    let queries = queryString.parse(location)
    if (checked) {
      queries[name] = checked
      console.log(queries)
    } else {
      delete queries[name]
    }

    const stringified = queryString.stringify(queries)
    const url = `${window.location.pathname}?${stringified}`
    window.history.pushState({}, '', url);

    this.setState({ [name]: checked }, () => {
      this.delaydebouncedFetch()
    })
  }

  render() {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ row, value }) => {
          return (
            <input
              type="checkbox"
              className="checkbox ml-3"
              //checked={}
              onChange={(e) => this.handleCheckboxChange(e, value)}
            />
          );
        },
        Header: (row) => {
          const selectedAllDataList = row.data;
          return (
            <input
              type="checkbox"
              className="checkbox"
              //checked={}
              //ref={}
              onChange={() => this.toggleSelectAll(selectedAllDataList)}
            />
          );
        },
        show: true
      },
      {
        Header: 'Shipper order id',
        accessor: 'shipper_order_id',
        Cell: (props) => {
          const shipperOrderId = props.original.shipper_order_id;
          return shipperOrderId !== null && shipperOrderId.length > 0 ? shipperOrderId : 'N/A';
        },
        show: this.state.shipperOrderIdStatus
      },
      {
        Header: 'Tracking no',
        accessor: 'tracking_no',
        width: 200,
        show: this.state.trackingNoStatus
      },
      {
        Header: 'Status code',
        accessor: 'tracker_status_code',
        show: this.state.statusCodeStatus
      },
      {
        Header: 'Consignee name',
        accessor: 'consignee_name',
        show: this.state.consigneeNameStatus
      },
      {
        Header: 'Pickup country',
        accessor: 'pickup_country',
        show: this.state.pickupCountryStatus
      },
      {
        Header: 'Consignee country',
        accessor: 'consignee_country',
        show: this.state.consigneeCountryStatus
      },
      {
        Header: 'Consignee address',
        accessor: 'consignee_address',
        show: this.state.consigneeAddressStatus
      },
      {
        Header: 'Upload batch no',
        accessor: 'upload_batch_no',
        show: this.state.uploadBatchNoStatus
      },
      {
        Header: 'Phone Number',
        accessor: 'consignee_number',
        show: this.state.phoneNumberStatus
      },
      {
        Header: 'Scheduled Pickup Date',
        accessor: 'pickup_date',
        Cell: (props) => {
          return props.value ? moment(props.value).format('DD/MM/YY') : props.value;
        },
        show: this.state.pickupDateStatus
      },
      {
        Header: 'Created on',
        accessor: 'created_on',
        Cell: (props) => {
          return moment(props.value).format('DD/MM/YY HHmm[HRS]');
        },
        show: this.state.createdOnStatus
      },
      {
        Header: 'Consignee Customs Document',
        accessor: 'customs_documents_status',
        Cell: (props) => {
          let fontColor = '#000000'
          switch(props.value){
            case 'Pending Documents': 
                fontColor = '#FF8900';
                break;
            case 'Documents Uploaded':
                fontColor = '#27AE60';
                break;
          }
          
          let label = (
            <label style={{ color:fontColor }}>{props.value}</label>
          )
          return props.value ? label : 'N/A';
        },
        show: this.state.consigneeCustomsDocuments
      },
      {
        id: "button",
        Header: 'Action',
        accessor: "",
        width: 180,
        Cell: ({ row, value }) => {
          const orderId = value.order_id;
          const trackingNo = value.tracking_no;
          const isProcessing = value.is_processing || ((new Date(value.created_on) > new Date(2019,6,20))  && !value.order_label_url)
          let printButton = !!this.state.printingOrder.includes(value.tracking_no)

          let actionView = null;
          if (isProcessing) {
            actionView = (
              <div>
                <Trans i18nKey="orders.orderIsProcessing" />
              </div>
            )
          } else {
            actionView = <div>
              <button type="button" className="btn btn-primary mr-1" onClick={() => this.handleViewButton(orderId)}>
                <Trans i18nKey="orders.view" />
              </button>
              <button type="button" className="btn btn-success mr-1" onClick={() => this.handleTrackButton(trackingNo)}>
                <Trans i18nKey="orders.track" />
              </button>
              <button type="button" className="btn btn-info" disabled={printButton} onClick={() => this.handlePrintButton(value)}>
                <Trans i18nKey="orders.print" />
              </button>
              {/*<button type="button" className="btn btn-danger" onClick={() => this.handleDeleteButton(orderId)}>Delete</button>*/}
            </div>;
          }

          return actionView;
        },
        show: true
      },
    ];

    _.filter(columns, (item, i) => {
      return item.show;
    });

    let renderDiv = null;
    if ((this.state.secretKey.length === 0 && this.state.data === undefined) ||
      (this.state.secretKey.length > 0 && this.state.data === undefined)) {
      renderDiv = <div>
        <div className="mt-4" style={{ textAlign: 'center' }}>
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

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-0 mb-3" role="alert"><Trans i18nKey="orders.orderListLoading" /></div>
            :
            null
        }

        {this.renderPagination()}

        <ReactTable
          noDataText="No order found"
          data={this.state.data}
          columns={columns}
          pageSize={this.state.pageSize}
          minRows={5}
          showPagination={false}
          // filterable
          // defaultFilterMethod={(filter, row) =>
          //   String(row[filter.id]).toUpperCase().includes(filter.value.toUpperCase())
          // }
        />

        {this.renderPagination()}

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="orders.orderListLoading" /></div>
            :
            null
        }

        {this.renderOrderActions()}

        {this.renderFixedBottomButton()}

        <img id="twoGoExpressLogo" crossOrigin="Anonymous" alt="" src={twoGoExpressLogo} style={{ display: 'none' }} />
        <img id="logo" crossOrigin="Anonymous" alt="" src={stickerLogo} style={{ display: 'none' }} />
        {this.renderPartnerLogo()}
        <img id="barcode" alt="" style={{ display: 'none' }} />
        <img id="secondBarcode" alt="" style={{ display: 'none' }} />
        <canvas id="canvas" style={{ display: 'none' }} />
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, order }) {
  return ({
    error: order.error,
    shipperDetails: shipperDetails.shipperDetails,
    message: order.message,
    statuses: order.statuses,
    countries: order.countries,
    uploadBatchNo: order.updateBatchNo,
    service: order.service,
    data: order.orders,
    totalOrders: order.totalOrders,
    totalPages: order.totalPages,
    lastUpdated: order.lastUpdated,
    queryId: order.queryId
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchService,
    fetchStatuses,
    fetchAllCountries,
    fetchUploadBatchNo,
    fetchPrevious,
    fetchNext,
    fetchOrderByFilter,
    deleteOrder,
    clearOrderErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(ViewOrders);
