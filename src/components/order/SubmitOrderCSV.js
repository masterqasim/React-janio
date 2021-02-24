import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { connect } from "react-redux";
import _ from 'lodash';
import moment from 'moment';
import ReactFileReader from 'react-file-reader';
import Select from 'react-select';
import csv from 'csvtojson';
import readXlsxFile from 'read-excel-file';
import XLSX from 'xlsx';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import Popup from "reactjs-popup";

import { history } from '../../utils/historyUtils';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import { fetchPickupPoint } from '../../actions/pickupPointActions';
import {
  fetchService,
  addOrders,
  clearOrderErrors,
  fetchParkers,
} from '../../actions/orderActions';

import DropdownField from '../common/DropdownField';


const excelTemplateLink = 'https://res.cloudinary.com/janio/raw/upload/v1567501163/janio_bulk_order_submission_template.xlsx';
const csvTemplateLink = 'https://res.cloudinary.com/janio/raw/upload/v1569824910/janio_bulk_order_submission_template.xlsx';

class SubmitOrderCSV extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      openErrorAlert: false,
      updatedStatus: false,
      fetched: false,
      addedService: false,
      addedPickupPoint: false,
      pnpDropoff: false,
      orderValueDeclaration: false,
      shipmentReweighsPolicy: false,
      servicePickupCountry: '',
      serviceConsigneeCountry: '',
      openOrderValueDeclaration: false,
      openShipmentReweighsPolicy: false,

      result: '',
      result2: '',
      shipperOrderIdObj: {},
      csvColumnOrderList: [],
      field: null,
      csvResultList: [],

      serviceId: 0,
      secretKey: '',
      allowPickup: null,
      pickupCountry: '',
      pickupContactName: '',
      pickupContactNumber: '',
      pickupState: '',
      pickupCity: '',
      pickupProvince: '',
      pickupPostal: '',
      pickupAddress: '',
      lastUpdated: moment(),
      loading: false,
      showExcelTemplate: false,
      serviceIdTouched: false
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    this.props.fetchPickupPoint();
    this.props.fetchParkers();
  }

  componentWillUnmount() {
    this.props.clearOrderErrors();
  }

  componentDidUpdate() {
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

    if (this.props.errorData !== this.state.errorData) {
      this.setState({
        openErrorAlert: true,
        errorData: this.props.errorData
      });
    }

    if (this.props.service === undefined && this.state.secretKey.length > 0 && !this.state.fetched) {
      this.props.fetchService(this.state.secretKey);
      this.setState({
        fetched: true
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

    if ((localStorage.getItem('service') && localStorage.getItem('pickupPoint')) || (localStorage.getItem('service') && localStorage.getItem('pickupPoint') === null)) {
      if (!this.state.addedService) {
        _.map(this.props.service, (item, i) => {
          if (localStorage.getItem('service') === item.service_name) {
            console.log('service item', item)
            const serviceIdValue = item.service_id || '';
            const allowPickup = item.allow_pickup || '';
            const pickupCountry = item.pickup_country || '';
            const pickupContactName = item.pickup_contact_name || '';
            const pickupContactNumber = item.pickup_contact_number || '';
            const pickupState = item.pickup_state || '';
            const pickupCity = item.pickup_city || '';
            const pickupProvince = item.pickup_province || '';
            const pickupPostal = item.pickup_postal || '';
            const pickupAddress = item.pickup_address ||
              `${pickupState}, ${pickupCity}, ${pickupProvince}`;

            this.setState({
              serviceId: serviceIdValue,
              allowPickup: allowPickup
            });

            if (allowPickup === false) {
              this.setState({
                pickupCountry,
                pickupContactName,
                pickupContactNumber,
                pickupState,
                pickupCity,
                pickupProvince,
                pickupPostal,
                pickupAddress,
              });
            }

            this.setState({
              addedService: true
            });
          }
        });
      }

      if (!this.state.addedPickupPoint) {
        _.map(this.props.pickupPoint, (item, i) => {
          if (localStorage.getItem('pickupPoint') === item.pickup_point_name && this.state.allowPickup === true) {
            console.log('itemitem', item)
            const pickupPointCountry = item.pickup_point_country || '';
            const pickupPointContactPerson = item.pickup_point_contact_person || '';
            const pickupPointNumber = item.pickup_point_number || '';
            const pickupPointState = item.pickup_point_state || '';
            const pickupPointCity = item.pickup_point_city || '';
            const pickupPointProvince = item.pickup_point_province || '';
            const pickupPointPostal = item.pickup_point_postal || '';
            const pickupPointAddress = item.pickup_point_address ||
              `${pickupPointState}, ${pickupPointCity}, ${pickupPointProvince}`;
            this.setState({
              pickupCountry: pickupPointCountry,
              pickupContactName: pickupPointContactPerson,
              pickupContactNumber: pickupPointNumber,
              pickupState: pickupPointState,
              pickupCity: pickupPointCity,
              pickupProvince: pickupPointProvince,
              pickupPostal: pickupPointPostal,
              pickupAddress: pickupPointAddress,
              addedPickupPoint: true
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
      value: 'select one...',
      label: this.props.t('common.selectOne'),
    }];

    _.map(this.props.service, (item, i) => {
      let data = {
        value: item.service_name,
        label: item.service_name
      };
      if (!options.some(o => o.value === item.service_name)) {
        options.push(data)
      }
    });

    return options;
  }

  renderPickupPoint = () => {
    let options = [{
      value: 'select one...',
      label: this.props.t('common.selectOne'),
    }];

    _.map(this.props.pickupPoint, (item, i) => {
      let data = {
        value: item.pickup_point_name,
        label: item.pickup_point_name
      };
      options.push(data);
    });

    return options;
  }

  handleServiceChange = (e) => {
    this.props.clearOrderErrors();
    this.setState({pnpDropoff: false, serviceIdTouched: true})

    const selectedValue = e.value;
    localStorage.setItem('service', selectedValue);

    if (selectedValue !== 'select one...') {
      const secretKeyValue = this.props.shipperDetails.agent_application_secret_key;
      _.map(this.props.service, (item, i) => {
        if (selectedValue === item.service_name) {
          const serviceIdValue = item.service_id;
          const allowPickup = item.allow_pickup;
          const pickupCountry = item.pickup_country || '';
          const pickupContactName = item.pickup_contact_name || '';
          const pickupContactNumber = item.pickup_contact_number || '';
          const pickupState = item.pickup_state || '';
          const pickupCity = item.pickup_city || '';
          const pickupProvince = item.pickup_province || '';
          const pickupPostal = item.pickup_postal || '';
          const pickupAddress = item.pickup_address ||
              `${pickupState}, ${pickupCity}, ${pickupProvince}`;
          const consigneeCountry = item.consignee_country || '';

          this.setState({
            serviceId: serviceIdValue,
            secretKey: secretKeyValue,

            allowPickup: allowPickup,

            servicePickupCountry: pickupCountry,
            serviceConsigneeCountry: consigneeCountry
          });
          const showExcelTemplate = ['Thailand', 'Malaysia', 'Indonesia', 'Philippines'].includes(consigneeCountry); 
          this.setState({
            showExcelTemplate
          })
          if (pickupCountry === consigneeCountry) {
            this.setState({
              shipmentReweighsPolicy: false,
              orderValueDeclaration: true
            })
          } else {
            this.setState({
              shipmentReweighsPolicy: false,
              orderValueDeclaration: false
            })
          }

          if (allowPickup === false || selectedValue.includes('ParknParcel')) {
            this.setState({
              pickupCountry,
              pickupContactName,
              pickupContactNumber,
              pickupState,
              pickupCity,
              pickupProvince,
              pickupPostal,
              pickupAddress,
            });
          } else {
            this.setState({
              pickupCountry: localStorage.getItem('pickupPointCountry') ? localStorage.getItem('pickupPointCountry') : '',
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

    if (selectedValue.includes('ParknParcel')){
      this.setState({pnpDropoff: true})
    }

  }

  handlePnpDropoff = (e) => {
    const parker = this.props.parkers.filter( item => (item.name +' - '+item.dropoff_address) === e.label)[0]
    const parker_data = {ParknParcel: {...parker}}
    this.setState({
      pickupAddress: parker.dropoff_address,
      pickupPostal: parker.dropoff_postal,
      pickupCountry: 'Singapore',
      pickupCity: 'Singapore',
      pickupContactName : this.props.shipperDetails.shipper_name,
      pickupContactNumber : this.props.shipperDetails.shipper_number,
      additional_data: parker_data})
  };

  renderParkers = () => {
    return this.props.parkers.map(item =>(
      {value: item.parker_id, label: (item.name +' - '+item.dropoff_address)}
    ))
  }

  handlePickupPointChange = (e) => {
    this.props.clearOrderErrors();

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

  handleDownloadCSV = () => {
     if (this.state.showExcelTemplate){
      window.open(excelTemplateLink);
    }else{
      window.open(csvTemplateLink);  
    }
  }

  handleFiles = async (files) => {
    const fileName = files[0].name;
    if (fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({
          openErrorAlert: false,
          updatedStatus: true,
          result: reader.result
        });
      }
      reader.readAsText(files[0]);
    } else if (fileName.endsWith('.xlsx')) {
      let result = '';
      const rows = await readXlsxFile(files[0]);
      _.map(rows, (row, i) => {
        // If cell value contains , in the value escape it using "" to make it a csv data
        row.map((item, index)=>{
          if (item && item.toString().includes(',')){
            row[index] = `"${item}"`
          }
        });
        //join considers null as blank, will add like this ,,
        result += row.join(',');
        result += '\n';

      });
      this.setState({
        openErrorAlert: false,
        updatedStatus: true,
        result: result,
      });
    } else if (fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = () => {
        const workBook = XLSX.read(reader.result, { type: "binary" });
        let data = null;
        workBook.SheetNames.forEach((sheetName) => {
          data = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName], { header: 1, defval: "" });
        });

        const result = data[0].join(',');
        const result2 = _.filter(data, (item, i) => {
          return i > 0;
        });
        this.setState({
          openErrorAlert: false,
          updatedStatus: true,
          result: result,
          result2: result2
        });
      }
      reader.readAsBinaryString(files[0]);
    }
  }

  handleSubmit = () => {
    this.props.clearOrderErrors();
    this.setState({
      loading: true,
      csvColumnOrderList: [],
      csvResultList: []
    });

    let data = {};
    if (this.state.result && !this.state.result2) {
      this.readColumn(data, this.state.result);
      this.readRow(this.state.result, true);
    } else {
      this.readColumn(data, this.state.result);
      _.map(this.state.result2, (item, i) => {
        this.readColumn(data, item.join(','));
      });

      setTimeout(() => {
        this.readRow(null, false);
      }, 3000);
    }
  }

  handleDeclarationCheckboxChange = (event) => {
    this.setState({
      [event.target.name]: event.target.checked
    })
  }

  readColumn = (data, str) => {
    // column
    csv({
      noheader: true
    })
      .fromString(str)
      .on('json', (json) => {
        let shipperOrderId = null;

        if (this.state.csvColumnOrderList.length === 0) {
          const csvHeadersList = Object.values(json);
          let needChange = false;
          _.map(csvHeadersList, (item, i) => {
            if (item.includes('shipper_order_id')) {
              if (!item.includes('(') || !/[\s]+/g.test(item)) {
                needChange = false;
              } else {
                needChange = true;
              }
            }
          });

          if (!needChange) {
            this.setState({
              csvColumnOrderList: csvHeadersList
            });
          } else {
            const newCsvHeadersList = _.map(csvHeadersList, (item, i) => {
              if (item.includes('(')) {
                item = item.substring(0, item.indexOf('(')).trim();
              }
              if (/[\s]+/g.test(item)) {
                item = item.substring(0, item.indexOf(' ')).trim();
              }
              return item;
            });
            this.setState({
              csvColumnOrderList: newCsvHeadersList
            });
          }
        }

        Object.entries(json).forEach(([key, value], i) => {
          if (value.includes('shipper_order_id')) {
            if (!value.includes('(') || !/[\s]+/g.test(value)) {
              this.setState({
                field: key
              });
            } else {
              if (value.includes('(')) {
                value = value.substring(0, value.indexOf('(')).trim();
              }
              if (/[\s]+/g.test(value)) {
                value = value.substring(0, value.indexOf(' ')).trim();
              }
              this.setState({
                field: key
              });
            }
          }
        });

        if (this.state.field) {
          shipperOrderId = json[this.state.field];
        }

        if (!shipperOrderId.includes('shipper_order_id')) {
          data[shipperOrderId] = [];

          this.setState({
            shipperOrderIdObj: data
          });
        }
      })
      .on('done', () => {
        console.log('add shipperOrderIdObj done');
      });
  }

  readRow = (str, isCSV) => {
    if (isCSV) {
      // row
      csv()
        .fromString(str)
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
          let ordersList = [];
          let itemsList = [];
          for (let i = 0; i < this.state.csvResultList.length; i++) {
            let allowAdd = false;

            const row = this.state.csvResultList[i];
            _.forEach(row, (item, i) => {
              if (!_.isEmpty(item)) {
                allowAdd = true;
              }
            });

            let shipperOrderId = null;
            _.map(this.state.csvColumnOrderList, (item, i) => {
              if (item.includes('shipper_order_id')) {
                if (!item.includes('(') && !/[\s]+/g.test(item)) {
                  shipperOrderId = row[i];
                } else {
                  if (row[i].includes('(')) {
                    row[i] = row[i].substring(0, row[i].indexOf('(')).trim();
                  }
                  if (/[\s]+/g.test(row[i])) {
                    row[i] = row[i].substring(0, row[i].indexOf(' ')).trim();
                  }

                  shipperOrderId = row[i];
                }
              }
            });

            const shipperOrderIdObjValue = this.state.shipperOrderIdObj[shipperOrderId];
            if (shipperOrderId) {
              if (shipperOrderIdObjValue !== undefined && allowAdd)
                shipperOrderIdObjValue.push(row);
            } else {
              let obj = {};
              if (allowAdd)
                obj[shipperOrderId] = row;

              if (!_.isEmpty(obj)) {
                const values = Object.values(obj);
                if (values.length > 0) {
                  const row = values[0];
                  this.setMap(map, row);
                  const itemsList = this.setItemsList(map);
                  this.setOrdersList(map, ordersList, itemsList);
                }
              }
            }
          }
          this.addOrders(map, ordersList, itemsList);
        });
    } else {
      let map = new Map();
      let ordersList = [];
      _.map(this.state.result2, (row, i) => {
        let allowAdd = false;

        _.forEach(row, (item, i) => {
          if (!_.isEmpty(item)) {
            allowAdd = true;
          }
        });

        let shipperOrderId = null;
        const csvColumnOrderList = this.state.result.split(',');
        _.map(csvColumnOrderList, (item, i) => {
          if (item.includes('shipper_order_id')) {
            if (!item.includes('(') && !/[\s]+/g.test(item)) {
              shipperOrderId = row[i];
            } else {
              if (row[i].includes('(')) {
                row[i] = row[i].substring(0, row[i].indexOf('(')).trim();
              }
              if (/[\s]+/g.test(row[i])) {
                row[i] = row[i].substring(0, row[i].indexOf(' ')).trim();
              }

              shipperOrderId = row[i];
            }
          }
        });

        const shipperOrderIdObjValue = this.state.shipperOrderIdObj[shipperOrderId];
        if (shipperOrderId) {
          if (shipperOrderIdObjValue !== undefined && allowAdd && !_.includes(shipperOrderIdObjValue, row))
            shipperOrderIdObjValue.push(row);
        } else {
          let obj = {};
          if (allowAdd)
            obj[shipperOrderId] = row;

          if (!_.isEmpty(obj)) {
            const values = Object.values(obj);
            if (values.length > 0) {
              const row = values[0];
              this.setMap(map, row);
              const itemsList = this.setItemsList(map);
              this.setOrdersList(map, ordersList, itemsList);
            }
          }
        }
      });
      // this.addOrders(map, ordersList, itemsList);
    }
  }

  setMap = (map, row) => {
    _.map(this.state.csvColumnOrderList, (item, i) => {
      const value = item;

      switch (value) {
        case 'shipper_order_id':
          map.set('shipperOrderId', row[i]);
          break;
        case 'tracking_no':
          map.set('trackingNo', row[i]);
          break;
        case 'item_desc':
          map.set('itemDesc', row[i]);
          break;
        case 'item_quantity':
          map.set('itemQuantity', row[i]);
          break;
        case 'item_product_id':
          map.set('itemProductId', row[i]);
          break;
        case 'item_sku':
          map.set('itemSku', row[i]);
          break;
        case 'item_category':
          map.set('itemCategory', row[i]);
          break;
        case 'item_price_value':
          map.set('itemPriceValue', row[i]);
          break;
        case 'item_price_currency':
          map.set('itemPriceCurrency', row[i]);
          break;
        case 'consignee_name':
          map.set('consigneeName', row[i]);
          break;
        case 'consignee_number':
          map.set('consigneeNumber', row[i]);
          break;
        case 'consignee_address':
          map.set('consigneeAddress', row[i]);
          break;
        case 'consignee_postal':
          map.set('consigneePostal', row[i]);
          break;
        case 'consignee_country':
          map.set('consigneeCountry', row[i]);
          break;
        case 'consignee_state':
          map.set('consigneeState', row[i]);
          break;
        case 'consignee_city':
          map.set('consigneeCity', row[i]);
          break;
        case 'consignee_province':
          map.set('consigneeProvince', row[i]);
          break;
        case 'consignee_email':
          map.set('consigneeEmail', row[i]);
          break;
        case 'order_length':
          map.set('orderLength', row[i]);
          break;
        case 'order_width':
          map.set('orderWidth', row[i]);
          break;
        case 'order_height':
          map.set('orderHeight', row[i]);
          break;
        case 'order_weight':
          map.set('orderWeight', row[i]);
          break;
        case 'incoterm':
          map.set('incoterm', row[i]);
          break;
        case 'payment_type':
          map.set('paymentType', row[i]);
          break;
        case 'cod_amt_to_collect':
          map.set('codAmountToCollect', row[i]);
          break;
        default:
          break;
      }
    });
  }

  setItemMap = (row) => {
    let map = new Map();

    _.map(this.state.csvColumnOrderList, (item, i) => {
      const value = item;

      switch (value) {
        case 'item_desc':
          map.set('itemDesc', row[i]);
          break;
        case 'item_quantity':
          map.set('itemQuantity', row[i]);
          break;
        case 'item_product_id':
          map.set('itemProductId', row[i]);
          break;
        case 'item_sku':
          map.set('itemSku', row[i]);
          break;
        case 'item_category':
          map.set('itemCategory', row[i]);
          break;
        case 'item_price_value':
          map.set('itemPriceValue', row[i]);
          break;
        case 'item_price_currency':
          map.set('itemPriceCurrency', row[i]);
          break;
        default:
          break;
      }
    });

    return map;
  }

  setItemsList = (map) => {
    const itemDesc = map.get('itemDesc');
    const itemQuantity = map.get('itemQuantity');
    const itemProductId = map.get('itemProductId');
    const itemSku = map.get('itemSku');
    const itemCategory = map.get('itemCategory');
    const itemPriceValue = map.get('itemPriceValue');
    const itemPriceCurrency = map.get('itemPriceCurrency');

    let itemsList = [];
    let data = {
      "item_desc": itemDesc,
      "item_quantity": parseInt(itemQuantity, 10),
      "item_product_id": itemProductId,
      "item_sku": itemSku,
      "item_category": itemCategory,
      "item_price_value": parseFloat(parseFloat(itemPriceValue, 10).toFixed(2)),
      "item_price_currency": itemPriceCurrency
    };
    itemsList.push(data);

    return itemsList;
  }

  setOrdersList = (map, ordersList, itemsList) => {
    const shipperOrderId = map.get('shipperOrderId');
    const trackingNo = map.get('trackingNo');
    const consigneeName = map.get('consigneeName');
    const consigneeNumber = map.get('consigneeNumber');
    const consigneeAddress = map.get('consigneeAddress');
    const consigneePostal = map.get('consigneePostal');
    const consigneeCountry = map.get('consigneeCountry');
    const consigneeState = map.get('consigneeState');
    const consigneeCity = map.get('consigneeCity');
    const consigneeProvince = map.get('consigneeProvince');
    const consigneeEmail = map.get('consigneeEmail');
    const orderLength = map.get('orderLength');
    const orderWidth = map.get('orderWidth');
    const orderHeight = map.get('orderHeight');
    const orderWeight = map.get('orderWeight');
    const incoterm = map.get('incoterm') || null;
    const paymentType = map.get('paymentType');
    const codAmountToCollect = !_.isEmpty(map.get('codAmountToCollect')) ? parseFloat(parseFloat(map.get('codAmountToCollect'), 10).toFixed(2)) : null;

    let ordersListData = {
      "service_id": this.state.serviceId,
      "consignee_name": consigneeName,
      "consignee_number": consigneeNumber,
      "consignee_address": consigneeAddress,
      "consignee_postal": consigneePostal,
      "consignee_country": consigneeCountry,
      "consignee_city": consigneeCity,
      "consignee_state": consigneeState,
      "consignee_province": consigneeProvince,
      "consignee_email": consigneeEmail,
      "shipper_order_id": shipperOrderId,
      "tracking_no": trackingNo,
      "order_length": parseFloat(parseFloat(orderLength, 10).toFixed(2)),
      "order_width": parseFloat(parseFloat(orderWidth, 10).toFixed(2)),
      "order_height": parseFloat(parseFloat(orderHeight, 10).toFixed(2)),
      "order_weight": parseFloat(parseFloat(orderWeight, 10).toFixed(2)),
      "pickup_country": this.state.pickupCountry,
      "pickup_contact_name": this.state.pickupContactName,
      "pickup_contact_number": this.state.pickupContactNumber,
      "pickup_state": this.state.pickupState,
      "pickup_city": this.state.pickupCity,
      "pickup_province": this.state.pickupProvince,
      "pickup_postal": this.state.pickupPostal,
      "pickup_address": this.state.pickupAddress,
      "incoterm": this.state.pickupCountry != consigneeCountry ? incoterm : null,
      "payment_type": paymentType,
      "cod_amt_to_collect": codAmountToCollect,
      "items": itemsList
    };
    if (this.state.additional_data){
      ordersListData.additional_data = this.state.additional_data
      }
    ordersList.push(ordersListData);
  }

  addOrders = (map, ordersList, itemsList) => {
    if (!_.isEmpty(this.state.shipperOrderIdObj)) {
      _.map(this.state.shipperOrderIdObj, (item, i) => {
        if (item.length > 1) {
          _.map(item, (row, i) => {
            if (i === 0) {
              this.setMap(map, row);
              itemsList = this.setItemsList(map);
              this.setOrdersList(map, ordersList, itemsList);
            } else {
              const itemMap = this.setItemMap(row);

              const itemDesc = itemMap.get('itemDesc');
              const itemQuantity = itemMap.get('itemQuantity');
              const itemProductId = itemMap.get('itemProductId');
              const itemSku = itemMap.get('itemSku');
              const itemCategory = itemMap.get('itemCategory');
              const itemPriceValue = itemMap.get('itemPriceValue');
              const itemPriceCurrency = itemMap.get('itemPriceCurrency');
              let data = {
                "item_desc": itemDesc,
                "item_quantity": parseInt(itemQuantity, 10),
                "item_product_id": itemProductId,
                "item_sku": itemSku,
                "item_category": itemCategory,
                "item_price_value": parseFloat(parseFloat(itemPriceValue, 10).toFixed(2)),
                "item_price_currency": itemPriceCurrency
              };
              itemsList.push(data);
            }
          });
        } else if (item.length === 1) {
          const row = item[0];
          this.setMap(map, row);
          const itemsList = this.setItemsList(map);
          this.setOrdersList(map, ordersList, itemsList);
        }
      });
    }

    if (this.state.secretKey.length > 0 && this.state.serviceId > 0) {
      this.props.addOrders(this.state.secretKey, ordersList);
    }
  }

  renderErrorAlert = () => {
    let errorDataDiv = null;

    let errorResult = null;
    let errorDataList = [];
    let invalidLocations = false
    if (this.state.errorData !== undefined && !_.isEmpty(this.state.errorData) && this.state.openErrorAlert) {
      if (_.has(this.state.errorData, 'orders')) {
        _.map(this.state.errorData.orders, (item, i) => {
          if (!_.isEmpty(item)) {
            const lineNumber = (i + 2);
            const keys = Object.keys(item);
            const values = Object.values(item);
            if (keys.length === 1 && values.length === 1) {
              const fieldName = keys[0];
              if (['pickup_state', 'pickup_city', 'consignee_state', 'consignee_city'].includes(fieldName)){
                console.log('included')
                invalidLocations =true
              }
              const message = JSON.stringify(values[0]).replace(/[\\["{}\]]/g, '');
              errorDataList.push(<div key={i}>Line {lineNumber}, {'"' + fieldName + '": ' + message}</div>);
            } else {
              let fieldNameAndMessage = '';

              const fieldNameItemList = keys;
              _.map(values, (messsageItem, i) => {
                let fieldName = fieldNameItemList[i];
                if (['pickup_state', 'pickup_city', 'consignee_state', 'consignee_city'].includes(fieldName)){
                  console.log('included')
                  invalidLocations =true
                }
                fieldNameAndMessage += '"' + fieldName + '": ' + JSON.stringify(messsageItem).replace(/[[\\["{}\]]/g, '') + ' ';
              });
              errorDataList.push(<div key={i}>Line {lineNumber}, {fieldNameAndMessage}</div>);
            }
          }
        });

        errorResult = errorDataList;
      } else if (_.has(this.state.errorData, 'message')) {
        errorResult = JSON.stringify(this.state.errorData);
      }

      errorDataDiv = <div className="alert alert-danger m-0" role="alert">
        <h5><b><Trans i18nKey="orders.error" /></b></h5>
        {errorResult}
        {invalidLocations
          ?<p className='my-2'> Oops, the city/state is not recognized. Please refer to this <a target='_blank' href='http://apidocs.janio.asia/locations'>link</a> for a comprehensive list of cities that we accept.</p>
          :null
        }
      </div>;
    }

    return errorDataDiv;
  }

  clearSubmitOrderFormLocalStorageData = () => {
    if (localStorage.getItem('service'))
      localStorage.removeItem('service');
    if (localStorage.getItem('pickupPoint'))
      localStorage.removeItem('pickupPoint');
  }

  resetStateData = () => {
    this.setState(this.state);
  }

  render() {
    return (
      <div>
        <div className="mt-4 container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="h5 mt-3 mb-3 font-weight-bold"><Trans i18nKey='orders.serviceConfiguration' /></div>
            <div onClick={this.handleDownloadCSV}>
              <button
                className="mb-3 w-100 btn btn-secondary"
                type="submit"
                disabled={!this.state.serviceConsigneeCountry}
                title={this.state.serviceConsigneeCountry? "": "Please select a service first"}
              >
              {this.state.showExcelTemplate? <Trans i18nKey="orders.downloadExcelTemplate" />:<Trans i18nKey="orders.downloadCSVTemplate" />}
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-sm">
              <Jumbotron className="p-4 border border-secondary mb-3">
                <DropdownField fieldName='service'
                  placeholder={localStorage.getItem('service') ? localStorage.getItem('service') : this.props.t('common.selectOne')}
                  i18nKey='orders.service' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false}
                  onChange={(e) => this.handleServiceChange(e)} renderItems={this.renderService()} />
              </Jumbotron>
            </div>
            <div className="col-sm">
              {!this.state.pnpDropoff
                ?(
                  <Jumbotron className="p-4 border border-secondary mb-3">
                    <DropdownField fieldName='pickupPoint / pickup' placeholder={localStorage.getItem('pickupPoint') ? localStorage.getItem('pickupPoint') : this.props.t('common.selectOne')} i18nKey='orders.pickup' labelClassName="mb-2" dropdownClassName="mb-3" disableLabel={false} allowPickup={this.state.allowPickup} onChange={(e) => this.handlePickupPointChange(e)} renderItems={this.renderPickupPoint()} />
                    {
                      this.state.allowPickup === false ?
                        <div className="alert alert-warning mt-2" role="alert">
                          <Trans i18nKey='orders.pickupNotAvaiableForThisService' />
                          <br />
                          <Trans i18nKey='orders.pleaseDropoffThePackageAt' />
                          <br />
                          {this.state.pickupAddress},&nbsp;
                          {this.state.pickupPostal},&nbsp;
                          {this.state.pickupProvince},&nbsp;
                          {this.state.pickupCity},&nbsp;
                          {this.state.pickupState},&nbsp;
                          {this.state.pickupCountry}
                        </div>
                        :
                        null
                    }
                    <div className="mt-3 d-flex justify-content-end">
                      <LinkContainer to={'/pickup-points'}>
                        <div className="btn btn-secondary"><Trans i18nKey='orders.manage' /></div>
                      </LinkContainer>
                    </div>
                  </Jumbotron>
                )
              :(
                <Jumbotron className="p-4 border border-secondary mb-3">
                    <div className='h5 mb-2 font-weight-bold capitalize'>
                      <h5 className='mb-2 font-weight-bold capitalize'>Park N Parcel Dropoff</h5>
                      <Select
                        className='mb-3'
                        placeholder='Select ParknParcel Dropoff Address'
                        isMulti={false}
                        isDisabled={false}
                        onChange={(e) => this.handlePnpDropoff(e)}
                        options={this.renderParkers()}
                      />
                    </div>
                  </Jumbotron>
              )}

            </div>
          </div>
        </div>

        {this.state.updatedStatus && this.state.secretKey.length > 0 && this.state.serviceId > 0
            ?
          <div className="mt-5 mb-5 container">
            <h5 className="mb-4 font-weight-bold"><Trans i18nKey="submitOrder.shipmentReweighsPolicy" /></h5>
            <div className="d-flex flex-row">
              <div className="custom-control custom-checkbox mr-1">
                <input type="checkbox" id="shipmentReweighsPolicy" className="custom-control-input mr-2"
                       name="shipmentReweighsPolicy" checked={this.state.shipmentReweighsPolicy} onChange={this.handleDeclarationCheckboxChange}/>
                <label className="custom-control-label" htmlFor="shipmentReweighsPolicy">
                  <Trans i18nKey='submitOrder.reweighBulkCheckboxText'/>
                </label>
              </div>
              <Popup
                  trigger={<a href="#" style={{borderBottom: "1px dashed currentColor", textDecoration: 'none'}}><Trans i18nKey="submitOrder.whyIsThisNeeded" /></a>}
                  position="top left"
                  open={this.state.openShipmentReweighsPolicy}
                  onOpen={() => {this.setState({openShipmentReweighsPolicy: true})}}
                  contentStyle={{width: 280, height: 190, borderRadius: "5px", boxShadow: "5px 5px 15px darkgrey", borderWidth: 0}}
              >
                <div className="d-flex flex-column align-content-center">
                  <label className="font-weight-bold m-3"><Trans i18nKey="submitOrder.shipmentReweighsPolicy" /></label>
                  <label className="ml-3 mr-3" style={{fontSize: 13}}>
                    <Trans i18nKey="submitOrder.shipmentReweighsPolicyText" />
                  </label>
                  <div className="d-flex justify-content-end mb-1">
                    <button type="button" className="btn btn-primary mt-1 mr-3" onClick={() => {this.setState({openShipmentReweighsPolicy: false})}}>
                      <Trans i18nKey="submitOrder.gotIt" />
                    </button>
                  </div>
                </div>
              </Popup>
            </div>

          {this.state.servicePickupCountry === this.state.serviceConsigneeCountry ? null :
            <div>
              <hr className="mt-4 mb-4"/>
              <h5 className="mb-4 font-weight-bold"><Trans i18nKey="submitOrder.orderValueDeclaration" /></h5>
              <div className="d-flex flex-row">
                <div className="custom-control custom-checkbox mr-1">
                  <input type="checkbox" id="orderValueDeclaration" className="custom-control-input mr-2"
                         name="orderValueDeclaration" checked={this.state.orderValueDeclaration} onChange={this.handleDeclarationCheckboxChange}/>
                  <label className="custom-control-label" htmlFor="orderValueDeclaration">
                    <Trans i18nKey='submitOrder.declarationBulkCheckboxText'/>
                  </label>
                </div>
                <Popup
                    trigger={<a href="#" style={{borderBottom: "1px dashed currentColor", textDecoration: 'none'}}><Trans i18nKey="submitOrder.whyIsThisNeeded" /></a>}
                    position="top left"
                    open={this.state.openOrderValueDeclaration}
                    onOpen={() => {this.setState({openOrderValueDeclaration: true})}}
                    contentStyle={{width: 290, height: 170, borderRadius: "5px", boxShadow: "5px 5px 15px darkgrey", borderWidth: 0}}
                >
                  <div className="d-flex flex-column align-content-center">
                    <label className="font-weight-bold m-3"><Trans i18nKey="submitOrder.orderValueDeclaration" /></label>
                    <label className="ml-3 mr-3" style={{fontSize: 13}}>
                      <Trans i18nKey="submitOrder.orderValueDeclarationText" />
                    </label>
                    <div className="d-flex justify-content-end mb-1">
                      <button type="button" className="btn btn-primary mt-1 mr-3" onClick={() => {this.setState({openOrderValueDeclaration: false})}}>
                        <Trans i18nKey="submitOrder.gotIt" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </div>
            </div>
          }

          </div>
            :
            null
        }

        <div className="container">
          {this.state.serviceIdTouched?
            this.state.secretKey.length > 0 && this.state.serviceId > 0 && this.state.pickupCountry.length > 0?
              null
              :
              <div className="alert alert-danger m-0" role="alert">
                <Trans i18nKey='orders.pleaseSelectServiceAndPickupPointFirst' />
              </div>
          :null}

          {
            this.state.updatedStatus && this.state.secretKey.length > 0 && this.state.serviceId > 0 && this.state.pickupCountry.length > 0 ?
              <div className="alert alert-success m-0" role="alert">
                <Trans i18nKey='orders.uploadCSVOrExcelFileSuccess' />
              </div>
              :
              null
          }

          {
            this.state.updatedStatus && this.state.secretKey.length > 0 && this.state.serviceId > 0 && this.state.pickupCountry.length > 0 ?
              <ReactFileReader handleFiles={this.handleFiles} fileTypes={['.csv', '.xlsx', '.xls']} multipleFiles={false}>
                <button type="button" className="w-100 btn btn-lg btn-secondary"><Trans i18nKey='orders.deleteCurrentAndUploadAnotherCSVOrExcel' /></button>
              </ReactFileReader>
              :
              // <ReactFileReader handleFiles={this.handleFiles} fileTypes={['.csv', '.xlsx', '.xls']} multipleFiles={false}>
              <ReactFileReader handleFiles={this.handleFiles} fileTypes={['.csv', '.xlsx']} multipleFiles={false}>
                <button type="button" className="w-100 btn btn-lg btn-success">
                  {this.state.showExcelTemplate? <Trans i18nKey='orders.uploadExcel' />:<Trans i18nKey='orders.uploadCSV' />}
                </button>
              </ReactFileReader>
          }

          {
            this.state.error === false ?
              <div className="alert alert-success mt-0" role="alert">
                <Trans i18nKey='orders.submitOrderSuccess' />
              </div>
              :
              null
          }

          {this.renderErrorAlert()}

          {
            this.state.loading ?
              <div className="alert alert-warning text-center w-100 m-0" role="alert"><Trans i18nKey='orders.loading' /></div>
              :
              null
          }

          {
            this.state.updatedStatus && this.state.secretKey.length > 0 && this.state.serviceId > 0 && !this.state.loading && this.state.shipmentReweighsPolicy && this.state.orderValueDeclaration ?
              <div onClick={this.handleSubmit}>
                <button
                  type="button"
                  className="w-100 btn btn-lg btn-success">
                  {/* <Trans i18nKey='orders.submitDeliveryOrderByCSVOrExcel' /> */}
                  {this.state.showExcelTemplate? <Trans i18nKey='orders.submitDeliveryOrderByExcel' />:<Trans i18nKey='orders.submitDeliveryOrderByCSV' />}
                </button>
              </div>
              :
              <div onClick={this.handleSubmit}>
                <button
                  type="button"
                  className="w-100 btn btn-lg btn-secondary"
                  disabled={true}>
                  {this.state.showExcelTemplate? <Trans i18nKey='orders.submitDeliveryOrderByExcel' />:<Trans i18nKey='orders.submitDeliveryOrderByCSV' />}
                </button>
              </div>
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, pickupPoint, order }) {
  return ({
    error: order.error,
    errorData: order.errorData,
    parkers: order.parkers,
    shipperDetails: shipperDetails.shipperDetails,
    service: order.service,
    pickupPoint: pickupPoint.pickupPoints
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchService,
    fetchPickupPoint,
    addOrders,
    clearOrderErrors,
    fetchParkers,
  }),
  withNamespaces('common')
)(SubmitOrderCSV);
