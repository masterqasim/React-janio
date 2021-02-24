import React, { Component } from "react";
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import moment from 'moment';
import ReactTable from "react-table";
import "react-table/react-table.css";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import b64toBlob from 'b64-to-blob';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchInvoicesWithFilter,
  fetchInvoicesPdf,
  fetchStatuses,
  clearInvoiceErrors
} from '../../actions/invoicesActions';

class Invoices extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      secretKey: '',
      fetchedInvoices: false,

      invoiceNo: '',
      statusCode: '',
      invoicesPdf: null,
      invoicesPdfStatus: null,

      selectAll: false,
      page: 1,
      selectedDataList: [],
      selectedAllDataList: [],
      lastUpdated: moment(),
      loading: false,
      showAllPageNums: false
    };

    this.throttledFetch = _.throttle(this.fetchInvoices, 3000, { 'trailing': true });
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.statuses === undefined) {
      this.props.fetchStatuses();
    }
  }

  componentDidUpdate() {
    if (this.state.secretKey && !this.state.fetchedInvoices) {
      this.fetchInvoices();
      this.setState({
        fetchedInvoices: true
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

    if (this.props.invoicesPdf !== this.state.invoicesPdf) {
      this.setState({
        invoicesPdf: this.props.invoicesPdf
      });
    }

    if (this.props.invoicesPdfStatus !== this.state.invoicesPdfStatus) {
      this.setState({
        invoicesPdfStatus: this.props.invoicesPdfStatus
      });
    }

    if (this.state.invoicesPdfStatus === 200) {
      if (this.state.invoicesPdf) {
        const base64String = this.state.invoicesPdf;
        const blob = b64toBlob(base64String, 'application/pdf');
        window.open(URL.createObjectURL(blob));
      }
    }

    if (this.props.shipperDetails !== undefined && this.state.secretKey.length === 0) {
      this.setState({
        secretKey: this.props.shipperDetails.agent_application_secret_key
      });
    }
  }

  componentWillUnmount() {
    this.props.clearInvoiceErrors();
  }

  renderStatuses = () => {
    let toReturn = [<option key={-1} value={''}>All Statuses</option>]
    _.forEach(this.props.statuses, (item, i) => {
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
      <nav aria-label="Page navigation example">
        <ul className="pagination d-flex flex-wrap mb-0">
          <li className="page-item" onClick={this.handlePreviousButton}><a className="page-link">Previous</a></li>
          {this.renderPageNumbers()}
          <li className="page-item mr-3" onClick={this.handleNextButton}><a className="page-link rounded">Next</a></li>
          <li className="page-item"><a className="page-link rounded bg-secondary text-white pointer-events-none">{this.props.totalInvoices} Invoices</a></li>
        </ul>
      </nav>
    )
  }

  renderFilters = () => {
    let filters = null;

    if (this.state.secretKey.length > 0 && this.props.data !== undefined) {
      filters = <div className="row">
        <div className="col-sm">
          <Jumbotron className="p-4 border border-secondary">
            <div className="h5 font-weight-bold"><Trans i18nKey="orders.filters" /></div>
            <div className="form-inline">
              <div className="d-flex mt-1 align-items-center mr-2">
                <div><Trans i18nKey="invoices.invoiceNo" /></div>
                <input
                  className="form-control ml-2 mr-sm-2"
                  type="search"
                  placeholder="Enter invoice no"
                  aria-label="Search"
                  name="invoiceNo"
                  value={this.state.invoiceNo}
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>
              <div className="d-flex mt-1 align-items-center mr-auto">
                <div><Trans i18nKey="invoices.statusCode" /></div>
                <select
                  id="statusCode"
                  className="ml-2 custom-select w-50"
                  name="statusCode"
                  value={this.state.statusCode != null ? this.state.statusCode : ''}
                  onChange={(e) => this.handleDropdownChange(e)}
                >
                  {this.renderStatuses()}
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

  fetchInvoices() {
    this.throttledFetch.cancel();

    let {
      secretKey,
      invoiceNo,
      statusCode,
      page
    } = this.state;

    if (secretKey) {
      this.props.fetchInvoicesWithFilter(secretKey, invoiceNo, statusCode, page);
    }
  }

  handleDropdownChange = (e) => {
    this.props.clearInvoiceErrors();
    this.setState({
      loading: true,
      page: 1
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

  toggleSelectAll = (selectedAllDataList) => {
    this.props.clearInvoiceErrors();

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
      invoiceNo: '',
      statusCode: '',
      loading: true,
      page: 1
    }, () => { this.throttledFetch() });
    this.resetToggleSelectAll();
  }

  handleCheckboxChange = (e, value) => {
    this.props.clearInvoiceErrors();

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
            return item.checkbox.InvoiceID !== value.InvoiceID;
          } else {
            return item.InvoiceID !== value.InvoiceID;
          }
        }),
        selectedAllDataList: this.state.selectedAllDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.InvoiceID !== value.InvoiceID;
          } else {
            return item.InvoiceID !== value.InvoiceID;
          }
        })
      });
    }
  }

  handleViewPdf = (invoiceId) => {
    this.props.clearInvoiceErrors();

    this.props.fetchInvoicesPdf(this.state.secretKey, invoiceId);
  }

  // handleMakePayment = () => {
  //   this.props.clearInvoiceErrors();
  //
  // }

  handleOnChange = (e) => {
    this.props.clearInvoiceErrors();
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
    this.props.clearInvoiceErrors();

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
    this.props.clearInvoiceErrors();

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
    this.props.clearInvoiceErrors();

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
      },
      {
        Header: 'Invoice number',
        accessor: 'InvoiceNumber'
      },
      {
        Header: 'Status',
        accessor: 'Status'
      },
      {
        Header: 'Date',
        accessor: 'DateString'
      },
      {
        Header: 'Total',
        accessor: 'Total'
      },
      {
        Header: 'Currency code',
        accessor: 'CurrencyCode'
      },
      {
        id: "button",
        Header: 'Action',
        accessor: "",
        width: 95,
        Cell: ({ row, value }) => {
          const invoiceId = value.InvoiceID;
          return (
            <div>
              <button type="button" className="btn btn-primary mr-1" onClick={() => this.handleViewPdf(invoiceId)}>View PDF</button>
              {/*<button type="button" className="btn btn-success" onClick={() => this.handleMakePayment()}>Make Payment</button>*/}
            </div>
          );
        }
      },
    ];

    let renderDiv = null;
    if ((this.state.secretKey.length === 0 && this.props.data === undefined) ||
      (this.state.secretKey.length > 0 && this.props.data === undefined)) {
      if (!this.state.errorData) {
        renderDiv = <div>
          <div className="mt-5 container">{this.renderFilters()}</div>
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
        renderDiv = <div className="mt-5 container">
          <div className="alert alert-info text-center w-100" role="alert">
            {this.state.errorData}
          </div>
        </div>;
      }
    } else {
      renderDiv = <div className="mt-4 container">
        {this.renderFilters()}

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-0 mb-3" role="alert"><Trans i18nKey="invoices.invoiceListLoading" /></div>
            :
            null
        }

        {this.renderPagination()}

        <ReactTable
          noDataText="No invoice found"
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

        {this.renderPagination()}

        {
          this.state.loading ?
            <div className="alert alert-warning text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="invoices.invoiceListLoading" /></div>
            :
            null
        }

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

function mapStateToProps({ invoices, shipperDetails }) {
  return ({
    error: invoices.error,
    errorData: invoices.errorData,
    shipperDetails: shipperDetails.shipperDetails,
    message: invoices.message,
    statuses: invoices.statuses,
    data: invoices.invoices,
    invoicesPdf: invoices.invoicesPdf,
    invoicesPdfStatus: invoices.invoicesPdfStatus,
    totalInvoices: invoices.totalInvoices,
    totalPages: invoices.totalPages,
    lastUpdated: invoices.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchInvoicesWithFilter,
    fetchInvoicesPdf,
    fetchStatuses,
    clearInvoiceErrors
  }),
  withNamespaces('common')
)(Invoices);
