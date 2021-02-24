import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { connect } from "react-redux";
import ReactFileReader from 'react-file-reader';
import csv from 'csvtojson';
import moment from 'moment';
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  addItemDetails,
  clearItemDetailsErrors
} from '../../actions/itemDetailsActions';

class AddItemDetails extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      openErrorAlert: false,
      updatedStatus: false,
      secretKey: '',

      result: '',
      csvResultList: [],
      lastUpdated: moment(),
      loading: false
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
  }

  componentWillUnmount() {
    this.props.clearItemDetailsErrors();
  }

  componentDidUpdate() {
    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.errorData !== this.state.errorData) {
      this.setState({
        openErrorAlert: true,
        errorData: this.props.errorData
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

    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.openErrorAlert && this.state.loading) {
      this.setState({
        loading: false
      });
    }

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
       this.setState({
         secretKey: this.props.shipperDetails.agent_application_secret_key
       });
    }
  }

  renderErrorAlert = () => {
    let errorDataDiv = null;

    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.openErrorAlert) {
      errorDataDiv = <div className="alert alert-danger m-0" role="alert">
        <h5><b>Error</b></h5>
        { JSON.stringify(this.state.errorData) }
      </div>;
    }

    return errorDataDiv;
  }

  handleFiles = (files) => {
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        openErrorAlert: false,
        updatedStatus: true,
        result: reader.result
      });
    }
    reader.readAsText(files[0]);
  }

  handleSubmit = () => {
    this.props.clearItemDetailsErrors();
    this.setState({
      loading: true,
      csvResultList: []
    });

    csv()
    .fromString(this.state.result)
    .on('csv', (csvRow) => {
      let csvRowList = [];
      csvRowList.push(csvRow);

      this.setState({
        csvResultList: this.state.csvResultList.concat(csvRowList)
      });
    })
    .on('done', () => {
      console.log('file read end');

      let map = new Map();
      let dataList = [];
      _.map(this.state.csvResultList, (item, i) => {
        const row = item;

        this.setMap(map, row);
        this.setDataList(map, dataList);
      });

      const data = {
        "secret_key": this.state.secretKey,
        "data": dataList
      };
      this.props.addItemDetails(data);
    });
  }

  setMap = (map, row) => {
    map.set('shipperProfile', row[0]);
    map.set('itemDesc', row[1]);
    map.set('itemCategory', row[2]);
    map.set('itemProductId', row[3]);
    map.set('itemSku', row[4]);
    map.set('itemPriceValue', row[5]);
    map.set('itemPriceCurrency', row[6]);
  }

  setDataList = (map, dataList) => {
    const shipperProfile = map.get('shipperProfile');
    const itemDesc = map.get('itemDesc');
    const itemCategory = map.get('itemCategory');
    const itemProductId = map.get('itemProductId');
    const itemSku = map.get('itemSku');
    const itemPriceValue = map.get('itemPriceValue');
    const itemPriceCurrency = map.get('itemPriceCurrency');

    let data = {
      "shipper_profile": shipperProfile ? parseInt(shipperProfile, 10) : '',
      "item_desc": itemDesc,
      "item_category": itemCategory,
      "item_product_id": itemProductId,
      "item_sku": itemSku,
      "item_price_value": itemPriceValue ? parseFloat(parseFloat(itemPriceValue, 10).toFixed(2)) : '',
      "item_price_currency": itemPriceCurrency
    };
    dataList.push(data);
  }

  resetStateData = () => {
    this.setState(this.state);
  }

  render() {
    let renderDiv = <div className="mt-4 container max-width-40">
      <Jumbotron className="p-4 border border-secondary">
        <h5><Trans i18nKey="itemDetails.addItemDetailsByCSV" /></h5>
        {
          this.state.updatedStatus ?
          <div className="alert alert-success m-0" role="alert">
            <Trans i18nKey="itemDetails.uploadCSVFileSuccess" />
          </div>
          :
          null
        }

        {
          this.state.updatedStatus ?
          <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'} multipleFiles={false}>
            <button type="button" className="w-100 btn btn-lg btn-secondary"><Trans i18nKey="itemDetails.deleteCurrentAndUploadAnotherCSV" /></button>
          </ReactFileReader>
          :
          <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'} multipleFiles={false}>
            <button type="button" className="w-100 btn btn-lg btn-success"><Trans i18nKey="itemDetails.uploadCSV" /></button>
          </ReactFileReader>
        }

        {
          this.state.error === false ?
          <div className="alert alert-success m-0" role="alert">
            <Trans i18nKey="itemDetails.addItemDetailsSuccess" />
          </div>
          :
          null
        }

        { this.renderErrorAlert() }

        {
          this.state.loading ?
          <div className="alert alert-warning text-center w-100 m-0" role="alert"><Trans i18nKey="itemDetails.loading" /></div>
          :
          null
        }

        {
          this.state.updatedStatus && !this.state.loading ?
          <div onClick={this.handleSubmit}>
            <button
            type="button"
            className="mb-1 w-100 btn btn-lg btn-success">
            <Trans i18nKey="itemDetails.submit" />
            </button>
          </div>
          :
          <div onClick={this.handleSubmit}>
            <button
            type="button"
            className="mb-3 w-100 btn btn-lg btn-secondary"
            disabled={true}>
            <Trans i18nKey="itemDetails.submit" />
            </button>
          </div>
        }
      </Jumbotron>
    </div>;

    return (
      <div>
        {renderDiv}
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, itemDetails }) {
  return ({
    error: itemDetails.error,
    errorData: itemDetails.errorData,
    shipperDetails: shipperDetails.shipperDetails,
    lastUpdated: itemDetails.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    addItemDetails,
    clearItemDetailsErrors
  }),
  withNamespaces('common')
)(AddItemDetails);
