import React, { Component } from "react";
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from "react-redux";
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import {
  fetchShipperDetails
} from '../../actions/shipperDetailsActions';
import { fetchStats } from '../../actions/statsActions';
import {
  fetchAllCountries,
  sendVerfication
} from '../../actions/orderActions';
import _ from 'lodash';
import { Modal, Checkbox, Button,Icon } from 'antd';
import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import DropdownField from '../common/DropdownField';
import { blue } from "@material-ui/core/colors";

const styles = (theme) => ({
  modal: {
    "&.ant-modal-header": {
        width: '90%',
        margin: '0 auto',
        padding: '16px 2px',
    },
  },
  boldText: {
    color: '#000'
  },
  containerDiv: {
    padding: '10px',
    border: '1px solid #e4e4e4',
    maxHeight: '45vh',
    overflow: 'scroll',
    overflowX: 'hidden',
    '::-webkit-scrollbar': {
      display: 'none'
  }
  },
  headings: {
    fontSize: '17px',
    fontWeight: 700,
    margin: '15px 0px',
},
plainText: {
  color: '#0a0a0a',
},
checkBoxDiv: {
  padding: '20px 0px'
},
MuiDialogTitle:{
  flex: "0 0 auto",
  margin: "0",
  padding: "18px 24px 10px"
},
submitBtn: {
  background: "#050593",
  color: '#fff',
  // width: '105px',
  borderRadius: '5px',
 "&:hover":{
  color:"black",
  borderColor:"black"
 }
},
MuiDialogContent:{
  flex: '1 1 auto',
  padding: '0 24px 13px',

},
btn: {
height:'30px impotant',
width:'200',
backgroundColor:'#050593'
}
});

class Stats extends Component {
  constructor() {
    super();
    this.state = {
      secretKey: '',
      selectedPickupCountry: '',
      selectedConsigneeCountry: '',
      stats: [],
      formated: false,
      updated: true,
      isAgree: false,
      showPolicies: true,
      showDailog: false
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.stats !== this.state.stats) {
      this.setState({
        stats: this.props.stats
      });
    }

    if (prevState.stats !== this.state.stats) {
      if (this.state.stats !== undefined && this.state.stats.length > 0 && !this.state.formated) {
        this.formatStats();
        this.setState({
          formated: true
        });
      }
    }

    if (this.state.secretKey.length > 0 && this.state.updated) {
      if (this.props.shipperDetails !== undefined) {
        const privilege = this.props.shipperDetails.privilege;
        if (privilege === 'admin' || privilege === 'viewer') {
          this.props.fetchStats(this.state.secretKey, this.state.selectedPickupCountry, this.state.selectedConsigneeCountry);
          this.setState({
            formated: false,
            updated: false
          });
        }
        if(this.props.shipperDetails && !this.props.shipperDetails.agreed_tnc && !this.state.showPolicies){
            this.setState({ showPolicies: true });
        }
      }
    }

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
      });
    }
  }

  handleDropdownChange = (e, type) => {
    if (type === 'pickupCountry') {
      const selectedPickupCountry = e.value;

      if (selectedPickupCountry !== undefined) {
        this.setState({
          selectedPickupCountry: selectedPickupCountry,
          updated: true
        });
      } else {
        this.setState({
          selectedPickupCountry: '',
          updated: true
        });
      }
    } else if (type === 'consigneeCountry') {
      const selectedConsigneeCountry = e.value;

      if (selectedConsigneeCountry !== undefined) {
        this.setState({
          selectedConsigneeCountry: selectedConsigneeCountry,
          updated: true
        });
      } else {
        this.setState({
          selectedConsigneeCountry: '',
          updated: true
        });
      }
    }

    if (this.state.stats) {
      _.forEach(this.state.stats, (stat) => {
        this.setState({ [stat.tracker_status_code]: 0 });
      });
    }
  }

  renderCountries = () => {
    let option = [{
      value: '',
      label: this.props.t('common.allCountries')
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

  renderStatBox = () => {
    let headers = null;

    if (this.props.shipperDetails !== undefined) {
      const language = this.props.shipperDetails.language;

      if (language === 'eng') {
        headers = {
          'Pending Pickup': 'ORDER_INFO_RECEIVED',
          'In Origin': 'ORDER_PICKED_UP',
          'At Local Sorting Center': 'ORDER_RECEIVED_AT_LOCAL_SORTING_CENTER',
          'With Airline': 'ORDER_RECEIVED_BY_AIRLINE',
          'Pending Customs Clearance': 'PENDING_CUSTOMS_CLEARANCE',
          'In Destination': 'ORDER_RECEIVED_AT_DESTINATION_WAREHOUSE',
          'On Delivery': 'DELIVERY_IN_PROGRESS',
          'Delivered': 'SUCCESS',
          'With Customer Service': 'WITH_CUSTOMER_SERVICE',
          'Cancelled By Customer': 'CANCELLED_BY_CUSTOMER',
        };
      } else if (language === 'chi') {
        headers = {
          '已下单': 'ORDER_INFO_RECEIVED',
          '等待收取': 'ORDER_PICKED_UP',
          '本地集散中心已收到订单': 'ORDER_RECEIVED_AT_LOCAL_SORTING_CENTER',
          '空运中': 'ORDER_RECEIVED_BY_AIRLINE',
          '等待通关': 'PENDING_CUSTOMS_CLEARANCE',
          '目的地仓库已经收到订单': 'ORDER_RECEIVED_AT_DESTINATION_WAREHOUSE',
          '运输中': 'DELIVERY_IN_PROGRESS',
          '已签收': 'SUCCESS',
          '客户服务': 'WITH_CUSTOMER_SERVICE',
          '客户取消': 'CANCELLED_BY_CUSTOMER',
        };
      } else if (language === 'cht') {
        headers = {
          '系統提交訂單': 'ORDER_INFO_RECEIVED',
          '待取件': 'ORDER_PICKED_UP',
          '寄件地轉運中心': 'ORDER_RECEIVED_AT_LOCAL_SORTING_CENTER',
          '空運進行中': 'ORDER_RECEIVED_BY_AIRLINE',
          '待通關': 'PENDING_CUSTOMS_CLEARANCE',
          '目的地轉運中心': 'ORDER_RECEIVED_AT_DESTINATION_WAREHOUSE',
          '配送中': 'DELIVERY_IN_PROGRESS',
          '已簽收': 'SUCCESS',
          '客服處理/需注意': 'WITH_CUSTOMER_SERVICE',
          '客户取消': 'CANCELLED_BY_CUSTOMER',
        };
      } else if (language === 'ind') {
        headers = {
          'Order Info Diterima': 'ORDER_INFO_RECEIVED',
          'Pesanan diambil': 'ORDER_PICKED_UP',
          'Order Diterima Di Pusat Sorting Lokal': 'ORDER_RECEIVED_AT_LOCAL_SORTING_CENTER',
          'Order Diterima Oleh Maskapai Penerbangan': 'ORDER_RECEIVED_BY_AIRLINE',
          'Izin Bea Cukai Tertunda': 'PENDING_CUSTOMS_CLEARANCE',
          'Order Diterima Di Gudang Tujuan': 'ORDER_RECEIVED_AT_DESTINATION_WAREHOUSE',
          'Pengiriman Dalam Kemajuan': 'DELIVERY_IN_PROGRESS',
          'Keberhasilan': 'SUCCESS',
          'Dengan Layanan Pelanggan': 'WITH_CUSTOMER_SERVICE',
          'Dibatalkan Oleh Pelanggan': 'CANCELLED_BY_CUSTOMER',
        };
      }
    }

    let statBoxes = [];
    _.forEach(headers, (value, key) => {
      statBoxes.push(
        <LinkContainer key={key} to={'/view-orders/statusCode=' + value} className="card m-1 pointer" style={{ width: '8rem' }}>
          <div className="card-body p-1">
            <h5 className="h2 card-title text-center font-weight-bold mt-3">
              {
                this.state[value] ?
                  this.state[value]
                  :
                  "0"
              }
            </h5>
            <h6 className="card-subtitle text-center mb-2">{key}</h6>
          </div>
        </LinkContainer>
      )
    });

    const errorHeaders = [
      'FAILED_DUE_TO_WRONG_ADDRESS',
      'FAILED_DUE_TO_CUSTOMER_UNCONTACTABLE',
      'FAILED_DUE_TO_CUSTOMER_REJECT_ORDER',
      'RETURNED_TO_LOCAL_SORTING_CENTER',
      'RETURNED_TO_DESTINATION_WAREHOUSE',
      'DESTROYED_AT_DESTINATION_WAREHOUSE'
    ];
    let errorStatTotal = 0;
    _.forEach(errorHeaders, (errorHeader) => {
      if (this.state[errorHeader]) {
        errorStatTotal = errorStatTotal + Number(this.state[errorHeader])
      }
    })

    statBoxes.push(
      <LinkContainer key='errors' to={window.location.pathname} className="card m-1" style={{ width: '8rem' }}>
        <div className="card-body p-1">
          <h5 className="h2 card-title text-center font-weight-bold mt-3">
            {
              errorStatTotal
            }
          </h5>
          <h6 className="card-subtitle text-center mb-2"><Trans i18nKey="stats.ordersReturnedOrRequiringAttention" /></h6>
        </div>
      </LinkContainer>
    )
    if (statBoxes.length % 2 !== 0) {
      statBoxes.push(
        <LinkContainer key='emptyBox' to={window.location.pathname} className="m-1" style={{ width: '8rem' }}>
          <div className="card-body p-1">
            {/*<h5 className="h2 card-title text-center font-weight-bold mt-3">
            0
            </h5>
            <h6 className="card-subtitle text-center mb-2">N/A</h6>*/}
          </div>
        </LinkContainer>
      )
    }

    return statBoxes;
  }

  renderBoxes = () => {
    let renderBoxes = null;

    if (this.props.shipperDetails !== undefined) {
      const privilege = this.props.shipperDetails.privilege;

      if (privilege === 'admin') {
        renderBoxes = <div>
          <div>
            <div className="mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
              <div className="row">
                <div className="ml-4 mb-4 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.60DaysOverview' /></div>
              </div>
              <div className="row">
                <div className="col-sm-5 pl-4">
                  <DropdownField fieldName='pickup country' placeholder={this.props.t('common.allCountries')} i18nKey='stats.pickupCountry' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupCountry')} renderItems={this.renderCountries()} />
                  <div className="mb-3" />
                  <DropdownField fieldName='consignee country' placeholder={this.props.t('common.allCountries')} i18nKey='stats.consigneeCountry' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'consigneeCountry')} renderItems={this.renderCountries()} />
                </div>

                <div className="col-sm-7">
                  <div className="w-100 d-flex flex-wrap justify-content-center container pr-0">
                    {this.renderStatBox()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.orders' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/view-orders/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.manageOrders' /></div>
              </LinkContainer>
              <LinkContainer to='/submit-order/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitSingleOrder' /></div>
              </LinkContainer>
              <LinkContainer to='/submit-order-csv/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitBulkOrders' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.analytics' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/reports/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.reports' /></div>
              </LinkContainer>
              <LinkContainer to='/invoices/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.billingAndInvoices' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.config' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/change-password/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.changePassword' /></div>
              </LinkContainer>
              <LinkContainer to='/pickup-points/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.addOrEditPickup' /></div>
              </LinkContainer>
              <LinkContainer to='/merchant-details/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.editCompanyProfile' /></div>
              </LinkContainer>
              <LinkContainer to='/user/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.editUserSettings' /></div>
              </LinkContainer>
            </div>
          </div>
        </div>;
      } else if (privilege === 'manager') {
        renderBoxes = <div>
          <div>
            <div className="mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
              <div className="row">
                <div className="ml-4 mb-4 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.60DaysOverview' /></div>
              </div>
              <div className="row">
                <div className="col-sm-5 pl-4">
                  <DropdownField fieldName='pickup country' placeholder='All Countries' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupCountry')} renderItems={this.renderCountries()} />
                  <div className="mb-3" />
                  <DropdownField fieldName='consignee country' placeholder='All Countries' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'consigneeCountry')} renderItems={this.renderCountries()} />
                </div>

                <div className="col-sm-7">
                  <div className="w-100 d-flex flex-wrap justify-content-center container pr-0">
                    {this.renderStatBox()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.orders' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/view-orders/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.manageOrders' /></div>
              </LinkContainer>
              <LinkContainer to='/submit-order/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitSingleOrder' /></div>
              </LinkContainer>
              <LinkContainer to='/submit-order-csv/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitBulkOrders' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.analytics' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/reports/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.reports' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.config' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/change-password/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.changePassword' /></div>
              </LinkContainer>
              <LinkContainer to='/pickup-points/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.addOrEditPickup' /></div>
              </LinkContainer>
            </div>
          </div>
        </div>;
      } else if (privilege === 'viewer') {
        renderBoxes = <div>
          <div>
            <div className="mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
              <div className="row">
                <div className="ml-4 mb-4 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.60DaysOverview' /></div>
              </div>
              <div className="row">
                <div className="col-sm-5 pl-4">
                  <DropdownField fieldName='pickup country' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'pickupCountry')} renderItems={this.renderCountries()} />
                  <div className="mb-3" />
                  <DropdownField fieldName='consignee country' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} onChange={(e) => this.handleDropdownChange(e, 'consigneeCountry')} renderItems={this.renderCountries()} />
                </div>

                <div className="col-sm-7">
                  <div className="w-100 d-flex flex-wrap justify-content-center container pr-0">
                    {this.renderStatBox()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.orders' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/view-orders/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.manageOrders' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.config' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/change-password/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.changePassword' /></div>
              </LinkContainer>
              <LinkContainer to='/pickup-points/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.addOrEditPickup' /></div>
              </LinkContainer>
            </div>
          </div>
        </div>;
      } else if (privilege === 'creator') {
        renderBoxes = <div>
          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.orders' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/submit-order/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitSingleOrder' /></div>
              </LinkContainer>
              <LinkContainer to='/submit-order-csv/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.submitBulkOrders' /></div>
              </LinkContainer>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 p-4 w-100 border border-secondary d-flex flex-wrap justify-content-start container max-width-70 rounded">
            <div>
              <div className="ml-2 mb-0 h1 font-weight-bold janio-colour"><Trans i18nKey='stats.config' /></div>
            </div>
            <div className="p-0 m-0">
              <LinkContainer to='/change-password/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.changePassword' /></div>
              </LinkContainer>
              <LinkContainer to='/pickup-points/'>
                <div className="btn btn-outline-secondary btn-large ml-2 mt-1" role="alert"><Trans i18nKey='stats.addOrEditPickup' /></div>
              </LinkContainer>
            </div>
          </div>
        </div>;
      }
    }

    return renderBoxes;
  }

  userAgree = () => {
    const { agent_application_secret_key } = this.props.shipperDetails;

    this.setState({
      showPolicies: false
    }, () => {
      let key = {"secret_key": agent_application_secret_key};
  
      this.props.sendVerfication(key);
    })
    
  };

  formatStats = () => {
    if (this.state.stats) {
      _.forEach(this.state.stats, (stat) => {
        this.setState({ [stat.tracker_status_code]: stat.tracker_status_code__count });
      });
    }
  }
handleModal =() =>{
  this.setState({ showPolicies: false })
  this.setState({showDailog:true})
  console.log('============')
}

handleClickOpen = () => {
  this.setState({showDailog:true})
};

handleClose = () => {
  this.setState({showDailog:false});
};
  render() {
    const { classes } = this.props;
    const { isAgree, showPolicies,showDailog } = this.state;
    return (
      <div>
        {this.renderBoxes()}

        <div className="my-5" />
        {/* dailog open */}
        <Dialog
        open={showDailog}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        
        <DialogTitle id="alert-dialog-title" className={classes.MuiDialogTitle}> <Icon type="question-circle" style={{color:'orange' ,fontSize:'40px'}} />{" Are you sure you want to close?"}</DialogTitle>
        <DialogContent className={classes.MuiDialogContent}>
          <DialogContentText  style={{ marginLeft: '16px'}}>
           if you choose to close you will be log out of the Merchant chat
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} className={classes.submitBtn}>
            Yes i'm sure
          </Button>
          <Button onClick={this.handleClose} className={classes.submitBtn}>
            No
          </Button>
        </DialogActions>
      </Dialog>
      {/* moda close */}
        <Modal
          title="Terms of Service"
          visible={showPolicies}
          footer={null}
          className={classes.modal}
          width={690}
          // onOk={this.handleOk}
          onCancel={this.handleModal}
        >
          <div className={classes.containerDiv}>
              <h5 className={classes.headings}>
                Updated as of 1st October 2019 
              </h5>

              <h5 className={classes.headings}>
                General Terms and Conditions of Janio Services
              </h5>

              <b className={classes.boldText}>
                1. Definitions <br />
              </b>
              <p className={classes.plainText}>
                1.1 The following definitions shall apply to the terms and conditions set out below: <br /><br /> 

                1.1.1 “article” means any object or thing submitted to Janio for delivery or returns under any Service but excluding such articles prohibited under these terms and conditions including articles excluded pursuant to the Prohibited Items list hereof; <br /><br />

                1.1.2 “Customer” means a customer who is using the Service (as defined below) and if the said customer is a corporation, the term “Customer” shall include any entity or entities authorised by such corporation to enjoy the benefit of the Service as specified in the Agreement; <br /><br />

                1.1.3 “Service” means any one or more of the Fulfillment and Logistics (B2C) offered by Janio; <br /><br />

                1.1.4 “Janio” means Taurus One Private Limited, a company with company registration number 201810116D, incorporated under the laws of the Republic of Singapore and having its registered office at 163 Tras Street, #10-05 Lian Huat Building, Singapore 079024. <br /><br />
              </p>


              <b className={classes.boldText}>2. Validity:</b> Pricing expires 30 days from the date specified on this quotation. Errors and omissions excepted. Prices subject to change without notice beyond offer date. <br /><br />

              <b className={classes.boldText}>3. Payment Schedule:</b> Payment schedule is dependent on the type of services procured. All Janio services are billed twice monthly, 30 days in arrears unless otherwise stated. <br /><br />
            <b className={classes.boldText}>4. Payment Terms</b> <br />

              <p className={classes.plainText}>
                4.1 In consideration for Janio’s deliverables as described in this document, Customer agrees to pay Janio the Fees as per this Agreement. <br /><br />

                4.2 Payment will be due, thirty days from the date of Janio invoice. Please refer to our bank details as follows: <br />
              </p>

              <b className={classes.boldText}>Bank Name:</b> <br /> 
              <p className={classes.plainText}>
                DBS Bank <br />
              </p>

              <b className={classes.boldText}>Bank Address:</b> <br />
              <p className={classes.plainText}>
                12 Main Boulevard <br />
                DBS Asia Central <br />
                Marina Bay Financial Centre Tower 3 <br />
                Singapore 018982 <br />
              </p> 

              <b className={classes.boldText}>Account Name:</b> 
              <p className={classes.plainText}>
              Taurus One Private Limited <br />
              </p>

              <b className={classes.boldText}>Account Number:</b> <br />
              <p className={classes.plainText}>
              0039564449<br />
              </p>

              <b className={classes.boldText}>Swift Code:</b><br />
              <p className={classes.plainText}>
              DBSSSGSG<br /><br />
              </p>

              <b className={classes.boldText}>Notification Email:</b> <br />
              <p className={classes.plainText}>
              billing@janio.asia <br /><br />
              </p>

              <p className={classes.plainText}>
                Please pay all Bank Charges & Telegraphic Transfer (TT) Charges in your remittance amount when sending telegraphic transfer to Janio. The remittance amount that Janio receive should reflect the grand total amount in the Proposal / Quotation / Agreement / Invoice including all taxes mentioned.<br />
                4.5 If the Customer fails to make a payment due to the Supplier under the Contract by the due date, the Customer shall pay interest on the overdue sum from the due date until payment of the overdue sum, whether before or after judgment. Interest will accrue each day at 4% a year above the SIBOR base rate from time to time, but at 4% a year for any period when that base rate is below 0%.<br />
                4.6 If Customer fails to pay any sum when due within thirty days after written notice, Janio may discontinue performance under this Agreement until payment is received without breach of this Agreement.<br /><br />

                4.7 Logistics (B2C) rates are billed per order, actual weight or volumetric weight (1/5000) whichever is higher, as measured by Janio (unless otherwise stipulated), and such determination by Janio of the weight shall be final and conclusive.<br /><br />
              </p>

              <b className={classes.boldText}>5. Taxes</b> <br /><br />                    
              <p className={classes.plainText}>
              5.1 The charges mentioned in this Agreement excludes the prevailing rate for Goods and Services Tax (GST) in Singapore. The invoice will include the GST to be paid for the services rendered.<br /><br />

              5.2 The customer(s) agree to pay Janio for any other additional taxes incurred by Janio in the rendering of our services to the customer(s). <br /><br />
              </p>

              <b className={classes.boldText}>6. Non-Solicitation of Employees</b><br />
              <p className={classes.plainText}>
              Customer agrees not to knowingly hire or solicit Janio’s employees during performance of this Agreement and for a period of one year after termination of this Agreement without Janio’s written consent.    <br /><br />
              </p>

              <b className={classes.boldText}>7. Customer’s Responsibilities</b><br />
              <p className={classes.plainText}>
                7.1 Customer shall provide one main point of contact through which all feedback and communication between the two organizations shall flow.<br /><br />

                7.2 Customer’s team shall agree to respond to all communications within two (2) business days and cooperate with Janio throughout the service to attain the service objective and scheduled timeline.<br /><br />

                7.3 Customer shall promptly pay all amounts due to Janio on demand. Prevailing charges for the Service apply. For more information, please request for the rate card by email at sales@janio.asia.<br /><br />

                7.4 Customer shall be liable for any charges, costs or expenses of whatsoever nature, including but not limited to storage charges, duties and taxes, retrieval and administrative costs in connection with the services performed and/or the article in the event that the addressee refuses to pay them;<br /><br />

                7.5 Customer shall be liable for all charges, costs or expenses of whatsoever nature, including but not limited to storage charges, duties and taxes, retrieval and administrative costs in connection with the cancellation of the Service or return (due to failure of delivery or otherwise) of any articles;<br /><br />

                7.6 Customer shall be liable for all GST charges imposed by the relevant governmental authority;<br /><br />

                7.7  Customer shall indemnify and keep Janio indemnified at all times from and against all demands, claims, actions, proceedings, charges, postages, costs or expenses, including but not limited to storage charges, duties and taxes, retrieval and administrative costs (including reasonable legal costs) incurred, suffered, or sustained by Janio in connection with the services performed hereunder.<br /><br />

                7.8 Customer shall ensure that every article is packed in a reasonably strong case, wrapper or cover appropriate to its contents, and so that no part of the contents can be removed without either breaking or tearing the case, wrapper or cover or forcing two adhesive surfaces apart, or breaking a seal;<br /><br />

                7.9 Customer shall ensure all contents of the article are adequately packed so as to protect against damage in the course of transmission and in particular, but not limited to:<br /><br />

                7.9.1  an article which is of a fragile nature shall be packed in a container of sufficient strength and shall be surrounded in that container with sufficient and suitable material to protect the article against the effect of such concussion, pressure and knocks to which postal articles are ordinarily exposed in transmission, and the article shall bear the words "FRAGILE HANDLE WITH CARE" written conspicuously in capital letters on the face of the cover above the address of the addressee;<br /><br />

                7.9.2  an article which is liable to be damaged by bending shall be packed in a container of sufficient strength to prevent the article from being bent or otherwise damaged in transmission, and the packet shall bear the words, "DO NOT BEND" written conspicuously in capital letters on the face of the cover above the address of the addressee;<br /><br />

                7.10 Customer shall ensure articles prohibited by any law in force in the Republic of Singapore and the country of destination for transmission will not be handed to Janio;<br /><br />

                7.11 Customer shall ensure that the name, address and the telephone number of the sender and addressee are completed accurately. For articles that are addressed to companies, the name of the company, address, name of addressee and department/section in which the addressee is located must be provided to ensure prompt delivery of articles;<br /><br />

                7.12 Customer shall ensure that an article complies with its destination country’s prevailing size and weight restrictions applicable to the specific Service pursuant to which such article is to be transmitted.<br /><br />

                7.13 Customer shall ensure that dimensions and weight submitted to Janio’s system are accurate, and Janio reserves the right to amend the information if there are any discrepancies for billing purposes.<br /><br />

                7.14 Customer shall ensure every article to be sent is addressed accurately to a valid registered address, to any destination only within the main island of the Republic of Singapore (including Sentosa Island but excluding the other off-shore islands, Paya Lebar Airport (Communication Centre) and Changi Airport (transit and restricted zones only)).; and<br /><br />

                7.15 Customer shall ensure it shall not address articles to be sent to destinations or addresses which Janio does not deliver to, as may be amended from time to time (wherever relevant).<br /><br />
              </p>

              <b className={classes.boldText}>8. Mediation, Dispute Resolution and Arbitration</b> <br />
              <p className={classes.plainText}>
                8.1 Janio and Customer shall each appoint a representative of suitable experience to be its single interface and point of initial contact for the duration of the Agreement.<br /><br />

                8.2 The parties, including the representatives, will meet regularly at mutually agreed times and locations to discuss issues arising in connection with performance of this Agreement by Janio and Customer.<br /><br />

                8.3 In the event there is an issue, which cannot be resolved at these review meetings, either party will designate a corporate executive who will meet to resolve the issue. <br /><br />

                8.4 If a dispute arises under this Agreement, the parties agree to resolve the dispute with the help of a mutually agreed-upon mediator in Singapore. The parties shall share any costs and fees equally other than legal counsel and lawyer fees associated with the mediation.<br /><br />

                8.5 If it proves impossible to arrive at a mutually satisfactory solution through mediation, the parties agree to submit the dispute to be settled by arbitration in accordance with the Singapore Arbitration Act, provided however, should any dispute arise under this Agreement, the parties shall endeavour to settle such dispute amicably between them. In the event that the parties fail to agree upon an amicable solution, such dispute shall be determined by arbitration as aforesaid.<br /><br />
              </p>

              <b className={classes.boldText}>9. Legal Fees </b> <br />               
              <p className={classes.plainText}>
                If any legal action is necessary to enforce this Agreement, the prevailing party shall be entitled to reasonable legal fees, costs and expenses.    <br /><br />            </p>
                      
              <b className={classes.boldText}>10. Termination of Agreement</b> <br />
              <p className={classes.plainText}>
              10.1 Each party shall have the right to terminate this Agreement by written notice to the other if a party has materially breached any obligation herein and such breach remains uncured for a period of thirty days after written notice of such breach is sent to the other party.<br /><br />

              10.2 If Janio terminates this Agreement because of Customer’s default, all of the following shall apply: <br />
              a)  Customer shall immediately cease use of any systems provided to Customer by Janio;<br />
              b)  All amounts payable or accrued to Janio under this Agreement shall become immediately due and payable;<br /><br />

              10.3 Customer may terminate this Agreement for its convenience upon thirty days with prior written notice to Janio. Upon such termination, all amounts owed to Janio under this Agreement for accepted work shall immediately become due and payable.<br /><br />
              </p>

              <b className={classes.boldText}>11. Force Majeure</b> <br />
              <p className={classes.plainText}>
                11.1 Force majeure events are classified as natural disasters, acts of government after the date of this Agreement, power failure, fire, flood, acts of God, labour disputes, riots, acts of war and epidemics. <br /><br />

                11.2 Janio will not be liable for delays or errors in its performance or for non- performance, due to causes beyond its reasonable control (“force majeure event”) and shall be entitled to a reasonable extension of time to remedy any such delay or failure to perform. <br /><br />

                11.3 Janio will give Customer notice as soon as practicably possible after becoming aware of the occurrence of a force majeure event and will inform Customer how long it is expected to continue.<br /><br />

                11.4 If a force majeure event prevents delivery of the Proposal and/or “Technical Support” for more than 60-days, Customer may follow the procedures set out for termination of this Agreement. <br /><br />

                11.5 In order to mitigate the consequences of a force majeure event, Customer is recommended to maintain a disaster recovery plan covering all equipment and/or software used by Janio in the delivery of the Proposal. Janio shall have a disaster recovery plan covering any equipment at an Janio site used by Janio to deliver the Agreement. <br /><br />

                11.6 Notwithstanding the occurrence of any force majeure event, Customer shall remain liable to pay Janio such portion of the Fees as mentioned, which Janio continues to perform in accordance with the Agreement for the duration of such force majeure event. <br /><br />
              </p>

              <b className={classes.boldText}>12. Limitation of Liability </b> <br />
              <p className={classes.plainText}>
                12.1 In no event shall Janio be liable to Customer for Customer’s loss of business, opportunities, profits or special or consequential damages, even if Janio has been advised of the possibility of such damages. <br /><br />

                12.2  Janio’s total liability under this Agreement for damages, costs and expenses, regardless of cause, shall not exceed a maximum of 50.00 USD or 10.00USD per kg, whichever is lower (for domestic Singapore deliveries), and a maximum of 100.00 USD or 10.00USD per kg, whichever is lower (for international deliveries), per commercial invoice. <br /><br />

                12.3 Janio shall not be liable for any claim or demand made against Customer by any third party except to the extent such claim or demand relates to copyright, trade secret or other proprietary rights, and then only as provided in this Agreement. <br /><br />
              </p>

              <b className={classes.boldText}>13. Notices </b> <br />
              <p className={classes.plainText}>
                13.1 No approval, acceptance, waiver, consent or other communication pursuant to this Agreement shall be valid unless made in writing, attached to this Agreement if it amends the Agreement, and signed by both parties. <br /><br />

                13.2 Notices or other communications (excluding payment) which either party is required or authorized to serve under this Agreement shall be deemed served if sent to the other party at the address specified below: <br />
                a)  On the day received if served by hand; <br />
                b)  On the next working day if served by facsimile transmission where sender has machine confirmation that facsimile was transmitted to the correct fax number listed below;<br /> 
                c)  Four working days after mailing if sent by certified, first class mail, return receipt requested, and <br />
                d)  On the day received if served by overnight express delivery. <br /><br />

                13.3 Notices or other communications to Janio hereunder shall be sent to the designated representative as follows:<br />                        
                    <b className={classes.boldText}>• Taurus One Private Limited   </b>                 <br />
                    • Attention: The Managing Director<br />
                    • Address: 109 North Bridge Rd, #05-21 Funan, Singapore 179097<br /><br />

                13.4 Notwithstanding Section 13.3, Janio may change the address to which notices from the other party must be sent by providing the other party with written notice of such change before the new address is to become effective. <br /><br />
              </p>

              <b className={classes.boldText}>14. Miscellaneous</b> <br /><br />
              <p className={classes.plainText}>
                14.1 Subcontractors. Janio reserves the right and Customer consents to Janio’s use of Subcontractors to assist in provision of this Agreement as Janio in its discretion deems appropriate without notice to Customer, subject to Janio obtaining the subcontractor’s written agreement to be bound by the terms of this Proposal. <br /><br />

                14.2 Non-publicity. This Agreement does not confer on Customer the right to use in any advertising, publicity, promotional, marketing or other activities any name, trade mark, trade name or other designation of Janio unless otherwise agreed in writing. Either party without the other party’s prior written approval may not disclose the terms and existence of this Agreement, except that Janio may add Customer’s name to its list of Customers on it’s website, marketing collateral and other publications which it deem appropriate and reasonable. <br /><br />

                14.3 Non-assignment. Subject to Janio’s appointment of subcontractors, neither party may assign any of the rights or obligations without the other party’s prior written consent. <br /><br />

                14.4 Waiver. Neither party’s failure to exercise any of its rights hereunder will constitute or be deemed a waiver or forfeiture of such rights. <br /><br />

                14.5 Headings. The headings in this Agreement are for the convenience of the parties only, and are in no way intended to define or limit the scope or interpretation of the Agreement or any provision hereof. <br /><br />

                14.6 Severability. Any term of this Agreement, which is held to be invalid, will be deleted, but the remainder of the Agreement will not be affected. In the event of a holding of invalidity so fundamental as to prevent the accomplishment of the purpose of the Agreement, the parties will immediately commence good faith negotiations to remedy such invalidity. <br /><br />

                14.7 Governing Law. This agreement shall be governed and construed in accordance with the laws of the Republic of Singapore and the parties to the jurisdiction of the courts of Singapore. <br /><br />

                14.8 Entire agreement. This Agreement and all incorporated documents constitute the entire agreement between Janio and Customer relating to the subject matter of the Agreement and supersede any prior or simultaneous communications, representations or agreements with respect hereto, whether oral or written. Any amendments (including without limitation any subsequent “Customer Purchase Order”) to this Agreement must be in writing and signed by authorized representatives of Janio and Customer. 
              </p>

              <b className={classes.boldText}>15. Term of Agreement</b> <br />
              <p className={classes.plainText}>
              This Agreement commences on the date it is executed and shall continue for as long as services are rendered, or until earlier terminated by one party under the terms of this Agreement.<br /><br />
              </p>

              <b className={classes.boldText}>16. Acceptance and Signatures</b><br />
              <p className={classes.plainText}>
                16.1 The Customer represents and warrants that on this date the Customer is duly authorized to bind their respective principals by their signatures below.<br /><br />

                16.2 By the signatures of the representative(s) below, Janio and the Customer agree to all of the terms of this Agreement. This Agreement once signed is considered final and valid as a Purchase Order from the Customer and the Customer agrees to pay for the services rendered at the prevailing rates of such services.<br /><br />

                16.3 If a Purchase Order is required in order for payment to be made in connection with this Agreement, Customer may provide such Purchase Order to Janio concurrent with the execution of this Agreement.<br /><br />
              </p>

              <b className={classes.boldText}>Acceptance</b><br /><br />
              <p className={classes.plainText}>
                By the signatures of their duly representatives below, the Customer agree to all of the terms of this proposal. The proposal once signed is considered final and valid as a Purchase Order from the Customer.<br /><br />

                If a Purchase Order is required in order for payment to be made in connection with this proposal, Customer may provide such Purchase Order to Janio concurrent with the execution of this proposal and all its Terms and Conditions.<br /><br />

                No cancellation of order is allowed by the Customer, once proposal is signed and/or submission of Purchase Order is submitted; otherwise refer to Disclaimer in section, “Termination of Agreement”.<br /><br />
              </p>
</div>
          <div className={classes.checkBoxDiv}>
            <Checkbox onChange={(e) => this.setState({ isAgree: e.target.checked })}>I agree to the above Terms of Service</Checkbox>
            {/* <span>I agree to the above Terms of Service</span> */}
          </div>
          <div>
            <Button onClick={this.userAgree} disabled={!isAgree} className={classes.submitBtn}>Submit</Button>
          </div>
        </Modal>
      </div>

    );
  }
}

function mapStateToProps({ shipperDetails, stats, order }) {
  console.log(shipperDetails, ">>>>>>")
  return ({
    shipperDetails: shipperDetails.shipperDetails,
    stats: stats.stats,
    countries: order.countries,
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchStats,
    fetchAllCountries,
    sendVerfication
  }),
  withStyles(styles),
  withNamespaces('common')
)(Stats);
