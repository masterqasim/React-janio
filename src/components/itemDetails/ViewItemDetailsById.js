import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import { validate } from '../../utils/validatorUtils';
import _ from 'lodash';
import moment from 'moment';
import momenttz from 'moment-timezone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from "../../utils/historyUtils";

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchItemCategory,
  fetchItemPriceCurrency
} from '../../actions/orderActions';
import {
  fetchItemDetailsById,
  updateItemDetailsById,
  clearItemDetailsErrors
} from '../../actions/itemDetailsActions';

import InputField from '../common/InputField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class ViewItemDetailsById extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      updatedStatus: false,
      currentItemDetailsId: null,
      fetched: false,
      added: false,
      anchorEl: null,

      secretKey: '',
      itemDetail: null,

      shipperProfile: '',
      itemDesc: '',
      itemCategory: '',
      itemProductId: '',
      itemSku: '',
      itemPriceValue: '',
      itemPriceCurrency: '',
      updated: moment()
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
    if (this.props.itemCategory === undefined) {
      this.props.fetchItemCategory();
    }
    if (this.props.itemPriceCurrency === undefined) {
      this.props.fetchItemPriceCurrency();
    }
  }

  componentWillUnmount() {
    this.props.clearItemDetailsErrors();
  }

  componentDidUpdate() {
    const currentItemDetailsId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
    if (this.props.shipperDetails !== undefined && !this.state.fetched) {
      this.props.fetchItemDetailsById(this.props.shipperDetails.agent_application_secret_key, currentItemDetailsId);
      this.setState({
        currentItemDetailsId: currentItemDetailsId,
        fetched: true
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

    if (this.props.itemDetail !== undefined) {
      if (this.props.itemDetail !== this.state.itemDetail && this.state.currentItemDetailsId === this.props.itemDetail.id) {
        this.setState({
          itemDetail: this.props.itemDetail
        });
      }
    }

    if (!_.isEmpty(this.state.itemDetail) && !this.state.added) {
      this.setState({
        shipperProfile: this.state.itemDetail.shipper_profile ? this.state.itemDetail.shipper_profile : '',
        itemDesc: this.state.itemDetail.item_desc ? this.state.itemDetail.item_desc : '',
        itemCategory: this.state.itemDetail.item_category ? this.state.itemDetail.item_category : '',
        itemProductId: this.state.itemDetail.item_product_id ? this.state.itemDetail.item_product_id : '',
        itemSku: this.state.itemDetail.item_sku ? this.state.itemDetail.item_sku : '',
        itemPriceValue: this.state.itemDetail.item_price_value ? this.state.itemDetail.item_price_value : '',
        itemPriceCurrency: this.state.itemDetail.item_price_currency ? this.state.itemDetail.item_price_currency : '',
        added: true
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

  renderItemCategory = () => {
    let options = [<option key={-1} value={''}>select one...</option>];

    _.map(this.props.itemCategory, (item, i) => {
      options.push(<option key={i} value={item}>{item}</option>);
    });

    return options;
  }

  renderItemPriceCurrency = () => {
    let options = [<option key={-1} value={''}>select one...</option>];

    _.map(this.props.itemPriceCurrency, (item, i) => {
      options.push(<option key={i} value={item.substring(0, 3)}>{item}</option>);
    });

    return options;
  }

  handleOnChange(e) {
    this.props.clearItemDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleDropdownChange = (e) => {
    this.props.clearItemDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleDateChange = (e, fieldName) => {
    this.props.clearItemDetailsErrors();
    this.setState({
      updatedStatus: true
    });

    this.setState({ [fieldName]: e });
  }

  handleEdit = () => {
    this.props.clearItemDetailsErrors();

    const validatorList = [
      { fieldName: 'shipperProfile', optional: false, type: 'number' },
      { fieldName: 'itemDesc', optional: false, type: 'text' },
      { fieldName: 'itemCategory', optional: false, type: 'text' },
      { fieldName: 'itemProductId', optional: false, type: 'number' },
      { fieldName: 'itemSku', optional: false, type: 'text' },
      { fieldName: 'itemPriceValue', optional: false, type: 'number' },
      { fieldName: 'itemPriceCurrency', optional: false, type: 'text' },
    ];
    const canSubmit = validate(validatorList, this.state, false);
    console.log(canSubmit);

    if (canSubmit) {
      const currentItemDetailsId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
      const userTimezone = momenttz.tz.guess();
      const updated = moment(this.state.updated).tz(userTimezone).format();
      const data = {
        "secret_key": this.props.shipperDetails.agent_application_secret_key,
        "shipper_profile": this.state.shipperProfile ? parseInt(this.state.shipperProfile, 10) : '',
        "item_desc": this.state.itemDesc,
        "item_category": this.state.itemCategory,
        "item_product_id": this.state.itemProductId ? parseInt(this.state.itemProductId, 10) : '',
        "item_sku": this.state.itemSku,
        "item_price_value": this.state.itemPriceValue ? parseFloat(parseFloat(this.state.itemPriceValue, 10).toFixed(2)) : '',
        "item_price_currency": this.state.itemPriceCurrency,
        "updated": updated
      };
      this.props.updateItemDetailsById(currentItemDetailsId, data);

      this.setState({
        updatedStatus: false
      });
    }
  }

  handleBackViewAllItemDetails = () => {
    history.push('/view-item-details');
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    return (
      <div>
        <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px'}}>
          <Jumbotron className="p-4 border border-secondary">
            <InputField fieldName='shipper profile' i18nKey='itemDetails.shipperProfileTitle' placeholder='itemDetails.shipperProfilePlaceholder' name='shipperProfile' type='number' stateValue={this.state.shipperProfile} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='itemDesc' i18nKey='itemDetails.itemDescTitle' placeholder='itemDetails.itemDescPersonPlaceholder' name='itemDesc' type='text' stateValue={this.state.itemDesc} onChange={this.handleOnChange.bind(this)} />
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey='itemDetails.itemCategoryTitle' />
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
              name="itemCategory"
              value={this.state.itemCategory}
              onChange={(e) => this.handleDropdownChange(e)}
            >
              { this.renderItemCategory() }
            </select>
            <InputField fieldName='itemProductId' i18nKey='itemDetails.itemProductIdTitle' placeholder='itemDetails.itemProductIdPlaceholder' name='itemProductId' type='number' stateValue={this.state.itemProductId} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='itemSku' i18nKey='itemDetails.itemSkuTitle' placeholder='itemDetails.itemSkuPlaceholder' name='itemSku' type='text' stateValue={this.state.itemSku} onChange={this.handleOnChange.bind(this)} />
            <InputField fieldName='itemPriceValue' i18nKey='itemDetails.itemPriceValueTitle' placeholder='itemDetails.itemPriceValuePlaceholder' name='itemPriceValue' type='number' stateValue={this.state.itemPriceValue} onChange={this.handleOnChange.bind(this)} />
            <div className="h5 font-weight-bold capitalize">
              <Trans i18nKey='itemDetails.itemPriceCurrencyTitle' />
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
              name="itemPriceCurrency"
              value={this.state.itemPriceCurrency}
              onChange={(e) => this.handleDropdownChange(e)}
            >
              { this.renderItemPriceCurrency() }
            </select>
            <div className="mb-3">
              <div className="h5 font-weight-bold capitalize">
                <Trans i18nKey="itemDetails.updatedTitle" />
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
              <DatePicker
                className="form-control"
                name="updated"
                selected={this.state.updated}
                onChange={(e) => this.handleDateChange(e, 'updated')}
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

            {
              this.state.error === false ?
              <div className="alert alert-success mb-2" role="alert">
                <Trans i18nKey='itemDetails.edititemDetailsuccess' />
              </div>
              :
              null
            }

            {
              this.state.errorData ?
              <div className="alert alert-danger mb-2" role="alert">
                <div><b><Trans i18nKey='itemDetails.error' /></b></div>
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
            <Trans i18nKey='itemDetails.edit' />
            </button>

            <button
            type="button"
            className="mb-3 w-100 btn btn-lg btn-success"
            onClick={this.handleBackViewAllItemDetails}>
            <Trans i18nKey="itemDetails.viewAllItemDetails" />
            </button>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, order, itemDetails }) {
  return ({
    error: itemDetails.error,
    errorData: itemDetails.errorData,
    shipperDetails: shipperDetails.shipperDetails,
    itemCategory: order.itemCategory,
    itemPriceCurrency: order.itemPriceCurrency,
    itemDetail: itemDetails.itemDetail
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchItemCategory,
    fetchItemPriceCurrency,
    fetchItemDetailsById,
    updateItemDetailsById,
    clearItemDetailsErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(ViewItemDetailsById);
