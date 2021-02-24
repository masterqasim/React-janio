import React, { Component } from "react";
import { LinkContainer } from 'react-router-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import ReactTable from "react-table";
import "react-table/react-table.css";
import moment from 'moment';
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';
import { history } from "../../utils/historyUtils";

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchSubProfiles,
  clearSubProfilesErrors
} from '../../actions/subProfilesActions';

class SubProfiles extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      fetched: false,
      secretKey: '',
      selectAll: false,
      page: 1,
      selectedDataList: [],
      selectedAllDataList: [],
      lastUpdated: moment(),
      loading: false,
      showAllPageNums: false,
    };

    this.throttledFetch = _.throttle(this.fetchSubProfiles, 3000, { 'trailing': true });
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
  }

  componentDidUpdate() {
    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
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

    if (this.props.shipperDetails !== undefined && !this.state.fetched) {
      this.props.fetchSubProfiles(this.props.shipperDetails.agent_application_secret_key);
      this.setState({
        fetched: true
      });
    }
  }

  fetchSubProfiles() {
    this.throttledFetch.cancel();

    if (this.props.shipperDetails !== undefined) {
      this.props.fetchSubProfiles(this.props.shipperDetails.agent_application_secret_key);
    }
  }

  toggleSelectAll = (selectedAllDataList) => {
    this.props.clearSubProfilesErrors();

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

  handleCheckboxChange = (e, value) => {
    this.props.clearSubProfilesErrors();

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
            return item.checkbox.agent_application_id !== value.agent_application_id;
          } else {
            return item.agent_application_id !== value.agent_application_id;
          }
        }),
        selectedAllDataList: this.state.selectedAllDataList.filter((item) => {
          if (_.has(item, 'checkbox')) {
            return item.checkbox.agent_application_id !== value.agent_application_id;
          } else {
            return item.agent_application_id !== value.agent_application_id;
          }
        })
      });
    }
  }

  handleEditButton = (agentApplicationId) => {
    this.props.clearSubProfilesErrors();

    history.push({
      pathname: `/view-sub-profile/${agentApplicationId}/`
    });
  }

  handlePreviousButton = () => {
    this.props.clearSubProfilesErrors();

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
    this.props.clearSubProfilesErrors();

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
    this.props.clearSubProfilesErrors();

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
        Header: 'Sub Profile Name',
        accessor: 'agent_application_name'
      },
      {
        Header: 'Sub Profile Email',
        accessor: 'agent_application_email'
      },
      {
        Header: 'Privilege',
        accessor: 'privilege'
      },
      {
        id: "button",
        Header: 'Action',
        accessor: "",
        width: 120,
        Cell: ({row, value}) => {
          const agentApplicationId = value.agent_application_id;
          return (
            <div className="d-flex justify-content-center">
              <button type="button" className="btn btn-primary mr-1" onClick={() => this.handleEditButton(agentApplicationId)}>Edit</button>
            </div>
          );
        }
      },
    ];

    let renderDiv = null;
    if (this.props.data === undefined) {
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
      renderDiv = <div className="mt-4 container">
        <div className="d-flex justify-content-end">
          <LinkContainer to={'/add-sub-profile'}>
            <div className="mb-3 btn btn-secondary"><Trans i18nKey="subProfiles.addTeamMember" /></div>
          </LinkContainer>
        </div>

        {
          this.state.loading ?
          <div className="alert alert-warning text-center w-100 mt-0 mb-3" role="alert"><Trans i18nKey="subProfiles.teamListLoading" /></div>
          :
          null
        }

        <ReactTable
          noDataText="No sub profiles found"
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

        {
          this.state.loading ?
          <div className="alert alert-warning text-center w-100 mt-3 mb-3" role="alert"><Trans i18nKey="subProfiles.teamListLoading" /></div>
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

function mapStateToProps({ shipperDetails, subProfiles }) {
  return ({
    error: subProfiles.error,
    shipperDetails: shipperDetails.shipperDetails,
    data: subProfiles.subProfiles,
    totalUsers: subProfiles.totalUsers,
    totalPages: subProfiles.totalPages,
    lastUpdated: subProfiles.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchSubProfiles,
    clearSubProfilesErrors
  }),
  withNamespaces('common')
)(SubProfiles);
