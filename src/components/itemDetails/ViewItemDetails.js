import React, { Component } from "react";
import { LinkContainer } from 'react-router-bootstrap';
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { CSVLink } from 'react-csv';
import { connect } from "react-redux";
import moment from 'moment';
import momenttz from 'moment-timezone';
import ReactTable from "react-table";
import "react-table/react-table.css";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from "../../utils/historyUtils";

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchItemCategory,
  fetchItemPriceCurrency
} from '../../actions/orderActions';
import {
  fetchItemDetailsWithFilter,
  getItemDetailsCSV,
  deleteItemDetailsById,
  clearItemDetailsErrors
} from '../../actions/itemDetailsActions';

class ViewItemDetails extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      secretKey: '',
      fetchedItemDetails: false,
      status: null,
      refetched: false,

      shipperProfile: '',
      itemDesc: '',
      itemCategory: '',
      itemProductId: '',
      itemSku: '',
      itemPriceValue: '',
      itemPriceCurrency: '',
      itemDetailsCSV: [],

      selectAll: false,
      page: 1,
      selectedDataList: [],
      selectedAllDataList: [],
      lastUpdated: moment(),
      loading: false,
      showAllPageNums: false
    };

    this.throttledFetch = _.throttle(this.fetchItemDetails, 3000, { 'trailing': true });
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.itemCategory === undefined) {
      this.props.fetchItemCategory();
    }
    if (this.props.itemPriceCurrency === undefined) {
      this.props.fetchItemPriceCurrency();
    }
  }

  componentDidUpdate() {
    if (this.state.secretKey && !this.state.fetchedItemDetails) {
      this.fetchItemDetails();
      this.setState({
        fetchedItemDetails: true
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

    if (this.state.status === 204 && !this.state.refetched) {
      this.fetchItemDetails();
      this.setState({
        refetched: true
      });
    }

    if (this.props.itemDetailsCSV !== this.state.itemDetailsCSV) {
      this.setState({
        itemDetailsCSV: this.props.itemDetailsCSV
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

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
       this.setState({
         secretKey: this.props.shipperDetails.agent_application_secret_key
       });
    }
  }

  componentWillUnmount() {
    this.props.clearItemDetailsErrors();
  }

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

  renderPageNumbers = () => {
    const { page, showAllPageNums } = this.state;
    let pageNumberDivs = [];
    let counter = 1;
    const { totalPages } = this.props;
    const that = this;

    if(totalPages <= 10 || showAllPageNums) {
      _.times(totalPages, () => {
        pageNumberDivs.push(
          <div onClick={(e) => that.handlePageClick(e)} key={counter}>
            <li className={`page-item ${page === counter ? "border border-dark rounded" : ""}`}>
              <a className={`page-link ${page === counter ? "font-weight-bold" : ""}`}>
              { counter }
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
              { counter }
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
          <div onClick={(e) => that.handlePageClick(e)} key={totalPages-counter}>
            <li className={`page-item ${page === totalPages-counter ? "border border-dark rounded" : ""}`}>
              <a className={`page-link ${page === totalPages-counter ? "font-weight-bold" : ""}`}>
              { totalPages-counter }
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
          { this.renderPageNumbers() }
          <li className="page-item mr-3" onClick={this.handleNextButton}><a className="page-link rounded">Next</a></li>
          <li className="page-item"><a className="page-link rounded bg-secondary text-white pointer-events-none">{this.props.totalItemDetails} Item details</a></li>
        </ul>
      </nav>
    )
  }

  renderFilters = () => {
    let filters = null;

    if (this.state.secretKey.length > 0 && this.props.data !== undefined) {
      filters = <div className="row">
        <div className="col-sm">
          <div className="d-flex justify-content-end">
            <LinkContainer to={'/add-item-details'}>
              <div className="mb-2 btn btn-secondary"><Trans i18nKey="itemDetails.addItemDetailsByCSV" /></div>
            </LinkContainer>
          </div>

          <div className="d-flex justify-content-end">
            <div onClick={this.handleDownloadCSVTemplate}>
              <button
              className="mb-2 btn btn-secondary"
              type="submit"
              >
              <Trans i18nKey="itemDetails.downloadCSVTemplate" />
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            {
              this.state.itemDetailsCSV !== undefined && this.state.itemDetailsCSV.length > 0 ?
              <CSVLink
              className="mb-2 btn btn-success"
              data={this.state.itemDetailsCSV}
              filename={"Janio Item details " + this.getCurrentDate() + ".csv"}
              target="_blank"
              >
              <Trans i18nKey="itemDetails.downloadItemDetailsInCSV" />
              </CSVLink>
              :
              <div onClick={this.handleGetItemsDetailsCSV}>
                <button
                className="mb-2 btn btn-secondary"
                type="submit"
                >
                <Trans i18nKey="itemDetails.getItemsDetailsCSV" />
                </button>
              </div>
            }
          </div>

          <Jumbotron className="p-4 border border-secondary">
            <div className="h5 font-weight-bold"><Trans i18nKey="orders.filters" /></div>
            <div className="form-inline">
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.shipperProfile" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="text"
                  placeholder="e.g. 10,11,12"
                  aria-label="Search"
                  name="shipperProfile"
                  value={this.state.shipperProfile}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.itemDesc" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="search"
                  placeholder="Enter item desc"
                  aria-label="Search"
                  name="itemDesc"
                  value={this.state.itemDesc}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.itemCategory" /></div>
                  <select
                    id="itemCategory"
                    className="ml-2 custom-select w-50"
                    name="itemCategory"
                    value={this.state.itemCategory != null ? this.state.itemCategory : ''}
                    onChange={(e) => this.handleDropdownChange(e, 'itemCategory')}
                  >
                  { this.renderItemCategory() }
                </select>
              </div>

              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.itemProductId" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="text"
                  placeholder="e.g. 10,11,12"
                  aria-label="Search"
                  name="itemProductId"
                  value={this.state.itemProductId}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.itemSku" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="search"
                  placeholder="e.g. ABC123,DEF456"
                  aria-label="Search"
                  name="itemSku"
                  value={this.state.itemSku}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="itemDetails.itemPriceValue" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="number"
                  placeholder="Enter item price value (per unit)"
                  aria-label="Search"
                  name="itemPriceValue"
                  value={this.state.itemPriceValue}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <div className="d-flex mt-1 align-items-center mr-auto">
                <div><Trans i18nKey="itemDetails.itemPriceCurrency" /></div>
                  <select
                    id="itemPriceCurrency"
                    className="ml-2 custom-select w-50"
                    name="itemPriceCurrency"
                    value={this.state.itemPriceCurrency != null ? this.state.itemPriceCurrency : ''}
                    onChange={(e) => this.handleDropdownChange(e, 'itemPriceCurrency')}
                  >
                  { this.renderItemPriceCurrency() }
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
          </Jumbotron>
        </div>
      </div>;
    }

    return filters;
  }

  fetchItemDetails() {
    this.throttledFetch.cancel();

    let {
      secretKey,
      shipperProfile,
      itemDesc,
      itemCategory,
      itemProductId,
      itemSku,
      itemPriceValue,
      itemPriceCurrency,
      page
    } = this.state;

    if (secretKey) {
      if (shipperProfile) {
        if (!shipperProfile.includes(',')) {
          shipperProfile = parseInt(shipperProfile, 10);
        }
      } else {
        shipperProfile = '';
      }

      if (itemProductId) {
        if (!itemProductId.includes(',')) {
          itemProductId = parseInt(itemProductId, 10);
        }
      } else {
        itemProductId = '';
      }

      itemPriceValue = itemPriceValue ? parseFloat(parseFloat(itemPriceValue, 10).toFixed(2)) : '';

      this.props.fetchItemDetailsWithFilter(secretKey, shipperProfile, itemDesc,
                                            itemCategory, itemProductId, itemSku,
                                            itemPriceValue, itemPriceCurrency, page);
    }
  }

  toggleSelectAll = (selectedAllDataList) => {
    this.props.clearItemDetailsErrors();

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
    this.props.clearItemDetailsErrors();
    this.setState({
      shipperProfile: '',
      itemDesc: '',
      itemCategory: '',
      itemProductId: '',
      itemSku: '',
      itemPriceValue: '',
      itemPriceCurrency: '',
      loading: true,
      page: 1
    }, () => { this.throttledFetch() });
    this.resetToggleSelectAll();
  }

  handleCheckboxChange = (e, value) => {
    this.props.clearItemDetailsErrors();

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

    if (e.target.checked) {
      this.setState({
        selectedDataList: this.state.selectedDataList.concat(newValue),
        selectedAllDataList: this.state.selectedAllDataList.concat(newValue)
      });
    } else {
      this.setState({
        selectedDataList: this.state.selectedDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.id !== value.id;
          } else {
            return item.id !== value.id;
          }
        }),
        selectedAllDataList: this.state.selectedAllDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.id !== value.id;
          } else {
            return item.id !== value.id;
          }
        })
      });
    }
  }

  handleDownloadCSVTemplate = () => {
    window.open('http://res.cloudinary.com/janio/raw/upload/v1543820694/janio-shipper-item-details-CSV.csv');
  }

  handleGetItemsDetailsCSV = () => {
    let {
      secretKey,
      shipperProfile,
      itemDesc,
      itemCategory,
      itemProductId,
      itemSku,
      itemPriceValue,
      itemPriceCurrency
    } = this.state;

    if (secretKey) {
      if (shipperProfile) {
        if (!shipperProfile.includes(',')) {
          shipperProfile = parseInt(shipperProfile, 10);
        }
      } else {
        shipperProfile = '';
      }

      if (itemProductId) {
        if (!itemProductId.includes(',')) {
          itemProductId = parseInt(itemProductId, 10);
        }
      } else {
        itemProductId = '';
      }

      itemPriceValue = itemPriceValue ? parseFloat(parseFloat(itemPriceValue, 10).toFixed(2)) : '';

      this.props.getItemDetailsCSV(secretKey, shipperProfile, itemDesc,
                                    itemCategory, itemProductId, itemSku,
                                    itemPriceValue, itemPriceCurrency);
    }
  }

  handleViewButton = (itemDetailsId) => {
    this.props.clearItemDetailsErrors();

    history.push({
      pathname: `/view-item-details/${itemDetailsId}`
    });
  }

  handleDeleteButton = (itemDetailsId) => {
    this.props.clearItemDetailsErrors();
    this.setState({
      loading: true
    });

    this.props.deleteItemDetailsById(this.state.secretKey, itemDetailsId);
  }

  handleOnChange = (e) => {
    this.props.clearItemDetailsErrors();
    this.setState({
      loading: true,
      page: 1
    });
    this.resetToggleSelectAll();

    const { name, value } = e.target;
    this.setState({ [name]: value }, () => {
      this.throttledFetch();
    });
  }

  handleDropdownChange = (e, fieldName) => {
    this.props.clearItemDetailsErrors();
    this.setState({
      loading: true,
      page: 1
    });
    this.resetToggleSelectAll();

    const { name, value } = e.target;
    this.setState({ [name]: value }, () => {
      this.throttledFetch();
    });
  }

  handlePreviousButton = () => {
    this.props.clearItemDetailsErrors();

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
    this.props.clearItemDetailsErrors();

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
    this.props.clearItemDetailsErrors();

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

  getCurrentDate = () => {
    const userTimezone = momenttz.tz.guess();
    const dateFrom = moment().tz(userTimezone).format('YYYYMMDDHHmm');
    return dateFrom;
  }

  render() {
    const columns = [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({row, value}) => {
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
      },
      {
        Header: 'Shipper profile',
        accessor: 'shipper_profile'
      },
      {
        Header: 'Item desc',
        accessor: 'item_desc'
      },
      {
        Header: 'Item category',
        accessor: 'item_category'
      },
      {
        Header: 'Item product id',
        accessor: 'item_product_id'
      },
      {
        Header: 'Item sku',
        accessor: 'item_sku'
      },
      {
        Header: 'Item price value',
        accessor: 'item_price_value'
      },
      {
        Header: 'Item price currency',
        accessor: 'item_price_currency'
      },
      {
        Header: 'Created',
        accessor: 'created',
        Cell: (props) => {
          return moment(props.value).format('DD/MM/YY HHmm[HRS]');
        }
      },
      {
        id: "button",
        Header: 'Action',
        accessor: "",
        width: 130,
        Cell: ({row, value}) => {
          const itemDetailsId = value.id;
          return (
            <div>
              <button type="button" className="btn btn-primary mr-1" onClick={() => this.handleViewButton(itemDetailsId)}>View</button>
              <button type="button" className="btn btn-danger" onClick={() => this.handleDeleteButton(itemDetailsId)}>Delete</button>
            </div>
          );
        }
      },
    ];

    let renderDiv = null;
    if ((this.state.secretKey.length === 0 && this.props.data === undefined) ||
        (this.state.secretKey.length > 0 && this.props.data === undefined)) {
      renderDiv = <div>
        <div className="mt-5 container">{ this.renderFilters() }</div>
        <div className="mt-3" style={{ textAlign: 'center' }}>
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
        { this.renderFilters() }

        {
          this.state.loading ?
          <div className="alert alert-warning text-center w-100 mt-0 mb-3" role="alert"><Trans i18nKey="itemDetails.itemDetailsListLoading" /></div>
          :
          null
        }

        {
          this.state.status === 204 ?
          <div className="alert alert-success text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="itemDetails.deleteItemDetailsSuccess" /></div>
          :
          null
        }

        { this.renderPagination() }

        <ReactTable
          noDataText="No item details found"
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

        { this.renderPagination() }

        {
          this.state.loading ?
          <div className="alert alert-warning text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="itemDetails.itemDetailsListLoading" /></div>
          :
          null
        }

        {
          this.state.status === 204 ?
          <div className="alert alert-success text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="itemDetails.deleteItemDetailsSuccess" /></div>
          :
          null
        }

        <div className="mb-4"/>
      </div>;
    }

    return (
      <div>
        {renderDiv}
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
    data: itemDetails.itemDetails,
    status: itemDetails.status,
    itemDetailsCSV: itemDetails.itemDetailsCSV,
    totalItemDetails: itemDetails.totalItemDetails,
    totalPages: itemDetails.totalPages,
    lastUpdated: itemDetails.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchItemCategory,
    fetchItemPriceCurrency,
    fetchItemDetailsWithFilter,
    getItemDetailsCSV,
    deleteItemDetailsById,
    clearItemDetailsErrors
  }),
  withNamespaces('common')
)(ViewItemDetails);
