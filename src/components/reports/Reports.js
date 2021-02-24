import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import momenttz from 'moment-timezone';
import _ from 'lodash';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchAllCountries
} from '../../actions/orderActions';
import {
  fetchOrdersInCSV,
  fetchTrackerUpdatesInCSV,
  clearReportErrors
} from '../../actions/reportsActions';
import {
  fetchService,
  fetchStatuses,
} from '../../actions/orderActions';

import SelectDropdown from "../common/SelectDropdown";

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class Reports extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      fetched: false,
      anchorEl: null,

      secretKey: '',
      serviceId: null,
      pickupCountry: '',
      consigneeCountry: '',
      statusCode: '',
      uploadBatchNo: '',
      dateFrom: moment().subtract(2, 'months').startOf('days'),
      dateTo: moment(),
      trackingNo: '',
      emails: '',

      ordersInCSV: [],
      trackerUpdatesInCSV: [],
      emailsMessage: null,

      lastUpdatedFetchOrdersDetails: moment(),
      lastUpdatedFetchTrackerUpdates: moment(),
      loadingFetchOrdersDetails: false,
      enableFetchOrdersDetails: true,
      loadingFetchTrackerUpdates: false,
      enableFetchTrackerUpdates: true,
      showFetchOrdersDetails: true,
      showFetchTrackerUpdates: true,
      selectedService: null,
      selected_consigneeCountry: null,
      selected_pickupCountry: null,
      selected_statusCode: null,
    };
  }

  componentDidMount() {
    const datePickerWrapperList = document.querySelectorAll('.react-datepicker-wrapper');
    datePickerWrapperList.forEach((item) => {
      item.setAttribute('class', 'w-100');
      item.parentNode.setAttribute('class', 'w-100');
    });

    const datePickerList = document.querySelectorAll('.react-datepicker__input-container');
    datePickerList.forEach((item) => {
      item.setAttribute('class', 'w-100');
    });

    this.props.fetchShipperDetails();
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
    if (this.props.statuses === undefined) {
      this.props.fetchStatuses();
    }
  }

  componentWillUnmount() {
    this.props.clearReportErrors();
  }

  componentDidUpdate() {
    if (this.props.service === undefined && this.state.secretKey.length > 0 && !this.state.fetched) {
      this.props.fetchService(this.state.secretKey);
      this.setState({
        fetched: true
      });
    }

    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.ordersInCSV !== this.state.ordersInCSV) {
      this.setState({
        ordersInCSV: this.props.ordersInCSV
      });
    }

    if (this.props.trackerUpdatesInCSV !== this.state.trackerUpdatesInCSV) {
      this.setState({
        trackerUpdatesInCSV: this.props.trackerUpdatesInCSV
      });
    }

    if (this.props.emailsMessage !== this.state.emailsMessage) {
      this.setState({
        emailsMessage: this.props.emailsMessage
      });
    }

    if (this.props.lastUpdatedFetchOrdersDetails && this.state.lastUpdatedFetchOrdersDetails) {
      if ((this.props.lastUpdatedFetchOrdersDetails.valueOf() > this.state.lastUpdatedFetchOrdersDetails.valueOf()) && this.state.loadingFetchOrdersDetails) {
        this.setState({
          loadingFetchOrdersDetails: false
        });
      }
    }

    if (this.props.lastUpdatedFetchOrdersDetails > this.state.lastUpdatedFetchOrdersDetails) {
      this.setState({
        lastUpdatedFetchOrdersDetails: this.props.lastUpdatedFetchOrdersDetails
      });
    }

    if (this.props.lastUpdatedFetchTrackerUpdates && this.state.lastUpdatedFetchTrackerUpdates) {
      if ((this.props.lastUpdatedFetchTrackerUpdates.valueOf() > this.state.lastUpdatedFetchTrackerUpdates.valueOf()) && this.state.loadingFetchTrackerUpdates) {
        this.setState({
          loadingFetchTrackerUpdates: false
        });
      }
    }

    if (this.props.lastUpdatedFetchTrackerUpdates > this.state.lastUpdatedFetchTrackerUpdates) {
      this.setState({
        lastUpdatedFetchTrackerUpdates: this.props.lastUpdatedFetchTrackerUpdates
      });
    }

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
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

  handleDateChange = (e, fieldName) => {
    this.props.clearReportErrors();
    this.setState({
      enableFetchOrdersDetails: true,
      enableFetchTrackerUpdates: true,
      showFetchOrdersDetails: true,
      showFetchTrackerUpdates: true,
    });

    this.setState({ [fieldName]: e });
  }

  handleDropdownChange = (e, type) => {
    this.props.clearReportErrors();
    this.setState({
      enableFetchOrdersDetails: true,
      enableFetchTrackerUpdates: true,
      showFetchOrdersDetails: true,
      showFetchTrackerUpdates: true,
    });

    if (e.length === 1) {
      if (type === 'service') {
        const serviceId = e[0].serviceId;

        if (serviceId !== undefined) {
          this.setState({
            serviceId: serviceId,
            selectedService: e
          });
        } else {
          this.setState({
            serviceId: null,
            selectedService: null
          });
        }
      } else {
        this.setState({ [type]: e[0].value, [`selected_${type}`]: e });
      }
    } else {
      if (type === 'service') {
        const serviceIdList = _.map(e, (item, i) => {
          return item.serviceId;
        });
        const serviceId = serviceIdList.join(',');

        if (serviceId !== undefined) {
          this.setState({
            serviceId: serviceId,
            selectedService: e
          });
        } else {
          this.setState({
            serviceId: null,
            selectedService: null
          });
        }
      } else {
        const valueList = _.map(e, (item, i) => {
          return item.value;
        });
        const value = valueList.join(',');

        this.setState({
          [type]: value,
          [`selected_${type}`]: e
        });
      }
    }
  }

  handleOnChange(e) {
    this.props.clearReportErrors();
    this.setState({
      enableFetchOrdersDetails: true,
      enableFetchTrackerUpdates: true,
      showFetchOrdersDetails: true,
      showFetchTrackerUpdates: true,
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleFetchOrdersDetails = () => {
    this.props.clearReportErrors();
    this.setState({
      loadingFetchOrdersDetails: true,
      enableFetchOrdersDetails: false,
      showFetchOrdersDetails: true,
      showFetchTrackerUpdates: false,
      ordersInCSV: []
    });

    if (this.state.secretKey.length > 0 && this.state.dateFrom !== null && this.state.dateTo !== null) {
      const userTimezone = momenttz.tz.guess();
      const dateFrom = moment(this.state.dateFrom).tz(userTimezone).format();
      const dateTo = moment(this.state.dateTo).tz(userTimezone).format();
      this.props.fetchOrdersInCSV(this.state.secretKey, this.state.serviceId, this.state.pickupCountry,
        this.state.consigneeCountry, this.state.uploadBatchNo, this.state.statusCode,
        dateFrom, dateTo, this.state.trackingNo,
        this.state.emails);
    }
  }

  handleFetchTrackerUpdates = () => {
    this.props.clearReportErrors();
    this.setState({
      loadingFetchTrackerUpdates: true,
      enableFetchTrackerUpdates: false,
      showFetchOrdersDetails: false,
      showFetchTrackerUpdates: true,
      trackerUpdatesInCSV: []
    });

    if (this.state.secretKey.length > 0 && this.state.dateFrom !== null && this.state.dateTo !== null) {
      const userTimezone = momenttz.tz.guess();
      const dateFrom = moment(this.state.dateFrom).tz(userTimezone).format();
      const dateTo = moment(this.state.dateTo).tz(userTimezone).format();
      this.props.fetchTrackerUpdatesInCSV(this.state.secretKey, this.state.serviceId, this.state.pickupCountry,
        this.state.consigneeCountry, this.state.uploadBatchNo, this.state.statusCode,
        dateFrom, dateTo, this.state.trackingNo,
        this.state.emails);
    }
  }

  // renderCountries = () => {
  //   let options = [{
  //     value: '',
  //     label: this.props.t('common.allServices')
  //   }];

  //   _.map(this.props.countries, (item, i) => {
  //     let data = {
  //       value: item,
  //       label: item
  //     }
  //     options.push(data);
  //   });

  //   return options;
  // }

  // renderStatuses = () => {
  //   let options = [{
  //     value: '',
  //     label: this.props.t('common.allStatuses')
  //   }];
  //   _.forEach(this.props.statuses, (item, i) => {
  //     let data = {
  //       value: item,
  //       label: item
  //     }
  //     options.push(data);
  //   });
  //   return options;
  // }

  renderPleaseEnterYourEmailAlert = () => {
    let pleaseEnterYourEmailAlert = null;

    if (this.state.emails.length === 0) {
      pleaseEnterYourEmailAlert = <div className="alert alert-warning text-center w-100 my-2" role="alert">
        <Trans i18nKey="reports.pleaseEnterYourEmail" />
      </div>;
    } else {
      const emailValid = this.validateStrIsEmail(this.state.emails);
      if (!emailValid) {
        pleaseEnterYourEmailAlert = <div className="alert alert-danger text-center w-100 my-2" role="alert">
          <Trans i18nKey="reports.emailIsNotValid" />
        </div>;
      }
    }

    return pleaseEnterYourEmailAlert;
  }

  validateStrIsEmail = (email) => {
    let result = null;

    if (!email.includes(',')) {
      const regex = /(\S+@\S+\.\S+)/g;
      result = regex.test(email);
    } else {
      let str = "(\\S+@\\S+\\.\\S+)";
      const commaCount = email.match(/,/g).length;
      for (let i = 0; i < commaCount; i++) {
        str += ",(\\S+@\\S+\\.\\S+)";
      }
      const regex = new RegExp(str);
      result = regex.test(email);
    }

    return result;
  }

  renderFetchOrdersDetailsButton = () => {
    let button = null;

    const emailValid = this.validateStrIsEmail(this.state.emails);

    if (this.state.secretKey.length > 0 && !this.state.loadingFetchOrdersDetails && this.state.enableFetchOrdersDetails &&
      this.state.emails.length > 0 && emailValid) {
      if (this.state.showFetchOrdersDetails) {
        button = <div onClick={this.handleFetchOrdersDetails}>
          <button
            type="button"
            className="w-100 btn btn-lg btn-success">
            <Trans i18nKey="reports.fetchOrdersDetails" />
          </button>
        </div>;
      }
    } else {
      button = <div onClick={this.handleFetchOrdersDetails}>
        <button
          type="button"
          className="w-100 btn btn-lg btn-secondary"
          disabled={true}>
          <Trans i18nKey="reports.fetchOrdersDetails" />
        </button>
      </div>;
    }

    return button;
  }

  renderFetchTrackerUpdatesButton = () => {
    let button = null;

    const emailValid = this.validateStrIsEmail(this.state.emails);

    if (this.state.secretKey.length > 0 && !this.state.loadingFetchTrackerUpdates && this.state.enableFetchTrackerUpdates &&
      this.state.emails.length > 0 && emailValid) {
      if (this.state.showFetchTrackerUpdates) {
        button = <div onClick={this.handleFetchTrackerUpdates}>
          <button
            type="button"
            className="w-100 mt-1 btn btn-lg btn-success">
            <Trans i18nKey="reports.fetchTrackerUpdates" />
          </button>
        </div>;
      }
    } else {
      button = <div onClick={this.handleFetchTrackerUpdates}>
        <button
          type="button"
          className="w-100 mt-1 btn btn-lg btn-secondary"
          disabled={true}>
          <Trans i18nKey="reports.fetchTrackerUpdates" />
        </button>
      </div>;
    }

    return button;
  }

  getDateFrom = () => {
    const userTimezone = momenttz.tz.guess();
    const dateFrom = moment(this.state.dateFrom).tz(userTimezone).format('YYYYMMDDHHmm');
    return dateFrom;
  }

  getDateTo = () => {
    const userTimezone = momenttz.tz.guess();
    const dateTo = moment(this.state.dateTo).tz(userTimezone).format('YYYYMMDDHHmm');
    return dateTo;
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    return (
      <div>
        <div className="mt-4 container max-width-40">
          <Jumbotron className="p-4 border border-secondary">
            <div>
              <h5>
                <Trans i18nKey="reports.service" />
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
              </h5>
              <SelectDropdown
                placeholder={this.props.t('common.allServices')}
                value={this.state.selectedService}
                onChange={(e) => this.handleDropdownChange(e, 'service')}
                isMulti={true}
                options={this.props.service}
                optionObject={item => ({
                  serviceId: item.service_id,
                  value: item.service_name,
                  label: item.service_name
                })} />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.pickupCountry" />
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
              </h5>
              {/* <DropdownField fieldName='pickup country' placeholder={this.props.t('common.allServices')} labelClassName="mb-2" dropdownClassName="mb-2" disableLabel={true} isMulti={true} onChange={(e) => this.handleDropdownChange(e, 'pickupCountry')} renderItems={this.renderCountries()} /> */}
              <SelectDropdown
                isMulti={true}
                placeholder={this.props.t('common.allCountries')}
                onChange={(e) => this.handleDropdownChange(e, 'pickupCountry')}
                value={this.state.selected_pickupCountry}
                options={this.props.countries}/>
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.consigneeCountry" />
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
              </h5>
              {/* <DropdownField fieldName='consignee country' placeholder={this.props.t('common.allServices')} labelClassName="mb-2" dropdownClassName="mb-2" disableLabel={true} isMulti={true} onChange={(e) => this.handleDropdownChange(e, 'consigneeCountry')} renderItems={this.renderCountries()} /> */}
              <SelectDropdown
                isMulti={true}
                placeholder={this.props.t('common.allCountries')}
                onChange={(e) => this.handleDropdownChange(e, 'consigneeCountry')}
                value={this.state.selected_consigneeCountry}
                options={this.props.countries}
              />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.uploadBatchNo" />
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
              </h5>
              <input
                className="form-control"
                name="uploadBatchNo"
                placeholder={this.props.t("reports.uploadBatchNoPlaceholder")}
                value={this.state.uploadBatchNo}
                onChange={this.handleOnChange.bind(this)}
              />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.statusCode" />
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
              </h5>
              {/* <DropdownField fieldName='status code' placeholder={this.props.t('common.allStatuses')} labelClassName="mb-2" dropdownClassName="mb-2" disableLabel={true} isMulti={true} onChange={(e) => this.handleDropdownChange(e, 'statusCode')} renderItems={this.renderStatuses()} /> */}
              <SelectDropdown
                isMulti={true}
                placeholder={this.props.t('common.allStatuses')}
                onChange={(e) => this.handleDropdownChange(e, 'statusCode')}
                value={this.state.selected_statusCode}
                options={this.props.statuses}
              />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.dateFrom" />
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
              </h5>
              <DatePicker
                className="form-control"
                name="dateFrom"
                selected={this.state.dateFrom}
                onChange={(e) => this.handleDateChange(e, 'dateFrom')}
                showTimeSelect
                dateFormat="DD/MM/YY HH:mm"
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="time"
                locale="en-gb"
                todayButton={"Today"}
                // readOnly={true}
              />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.dateTo" />
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
              </h5>
              <DatePicker
                className="form-control"
                name="dateTo"
                selected={this.state.dateTo}
                onChange={(e) => this.handleDateChange(e, 'dateTo')}
                showTimeSelect
                dateFormat="DD/MM/YY HH:mm"
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="time"
                locale="en-gb"
                todayButton={"Today"}
                // readOnly={true}
              />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.trackingNumbers" />
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
              </h5>
              <div className="form-group m-0">
                <textarea
                  name="trackingNo"
                  className="form-control"
                  rows="5"
                  placeholder="e.g. ACB1234567, DEF1234567, ..."
                  onChange={this.handleOnChange.bind(this)} />
              </div>
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="reports.emailsToSentReportTo" />
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
              </h5>
              <input
                className="mb-2 form-control"
                name="emails"
                placeholder={this.props.t("reports.emailsPlaceholder")}
                value={this.state.emails}
                onChange={this.handleOnChange.bind(this)}
              />
            </div>

            {
              this.state.loadingFetchOrdersDetails || this.state.loadingFetchTrackerUpdates ?
                <div className="alert alert-warning text-center w-100 m-0" role="alert">
                  <Trans i18nKey="reports.loadingThisMayTakeLonger" />
                </div>
                :
                null
            }

            {
              this.state.emailsMessage ?
                <div className="alert alert-success text-center w-100 m-0" role="alert">
                  {this.state.emailsMessage}
                </div>
                :
                null
            }

            {this.renderPleaseEnterYourEmailAlert()}

            {this.renderFetchOrdersDetailsButton()}

            {this.renderFetchTrackerUpdatesButton()}

            {
              this.state.ordersInCSV !== undefined && this.state.ordersInCSV.length > 0 && this.state.emails.length === 0 ?
                <CSVLink
                  className="w-100 mt-1 btn btn-lg btn-info"
                  data={this.state.ordersInCSV}
                  filename={"Janio Orders " + this.getDateFrom() + "-" + this.getDateTo() + ".csv"}
                  target="_blank"
                >
                  <Trans i18nKey="reports.downloadOrdersInCSV" />
                </CSVLink>
                :
                null
            }

            {
              this.state.trackerUpdatesInCSV !== undefined && this.state.trackerUpdatesInCSV.length > 0 && this.state.emails.length === 0 ?
                <CSVLink
                  className="w-100 mt-1 btn btn-lg btn-info"
                  data={this.state.trackerUpdatesInCSV}
                  filename={"Janio Tracker Updates " + this.getDateFrom() + "-" + this.getDateTo() + ".csv"}
                  target="_blank"
                >
                  <Trans i18nKey="reports.downloadTrackerUpdatesInCSV" />
                </CSVLink>
                :
                null
            }
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, order, reports }) {
  return ({
    error: reports.error,
    shipperDetails: shipperDetails.shipperDetails,
    countries: order.countries,
    service: order.service,
    statuses: order.statuses,
    ordersInCSV: reports.ordersInCSV,
    trackerUpdatesInCSV: reports.trackerUpdatesInCSV,
    emailsMessage: reports.emailsMessage,
    lastUpdatedFetchOrdersDetails: reports.lastUpdatedFetchOrdersDetails,
    lastUpdatedFetchTrackerUpdates: reports.lastUpdatedFetchTrackerUpdates,
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchAllCountries,
    fetchService,
    fetchStatuses,
    fetchOrdersInCSV,
    fetchTrackerUpdatesInCSV,
    clearReportErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(Reports);
