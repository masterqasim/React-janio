import React, { Component } from "react";
import { connect } from "react-redux";
import moment from 'moment';
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
  fetchPostalSearch,
  clearSearchPostalCodeErrors
} from '../../actions/searchPostalCodeActions';

import DropdownField from '../common/DropdownField';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class SearchPostalCode extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      anchorEl: null,

      secretKey: '',
      country: '',
      postalCode: '',
      lastUpdated: moment(),
      loading: false,
      postalSearch: []
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
    if (this.props.countries === undefined) {
      this.props.fetchAllCountries();
    }
  }

  componentDidUpdate() {
    if (this.props.error !== this.state.error) {
      this.setState({
        error: this.props.error
      });
    }

    if (this.props.postalSearch !== this.state.postalSearch) {
      this.setState({
        postalSearch: this.props.postalSearch
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
    this.props.clearSearchPostalCodeErrors();
  }

  renderCountry = () => {
    let options = [{
      value: '',
      label: 'All Countries'
    }];

    _.forEach(this.props.countries, (item, i) => {
      let data = {
        value: item,
        label: item
      }
      options.push(data);
    });

    return options;
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

  handleDropdownChange = (e, type) => {
    this.props.clearSearchPostalCodeErrors();

    if (type === 'country') {
      const country = e.value;
      if (country !== undefined) {
        this.setState({
          country: country
        });
      } else {
        this.setState({
          country: ''
        });
      }
    }

    this.setState({ [type]: e.value });
  }

  handleOnChange(e) {
    this.props.clearSearchPostalCodeErrors();

    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleKeyUp(e) {
    if (e.keyCode === 13 || e.which === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit = () => {
    this.props.clearSearchPostalCodeErrors();
    this.setState({
      loading: true
    });

    if (this.state.secretKey.length > 0 && this.state.postalCode && this.state.country) {
      this.props.fetchPostalSearch(this.state.secretKey, this.state.postalCode, this.state.country);
    }
  }

  renderPostalCodeList = () => {
    let postalCodeList = null;

    if (!_.isEmpty(this.state.postalSearch)) {
      let results = [];
      _.map(this.state.postalSearch, (item, i) => {
        const postalCode = item.postal_code;
        const country = item.country;
        const state = item.state;
        const city = item.city;
        const province = item.province;
        results.push(<div key={i} className="alert alert-secondary" role="alert">
          <span>{`Postal code: ${postalCode}`}</span><br />
          <span>{`Country: ${country}`}</span><br />
          <span>{`State: ${state}`}</span><br />
          <span>{`City: ${city}`}</span><br />
          <span>{`Province: ${province}`}</span><br />
        </div>
        );
      });

      postalCodeList = <div>
        <h5 className="font-weight-bold mb-2"><Trans i18nKey="searchPostalCode.results" /></h5>
        {results}
      </div>;
    } else {
      postalCodeList = <div className="alert alert-danger" role="alert">
        <Trans i18nKey="searchPostalCode.noPostalCodeResults" />
      </div>;
    }

    return postalCodeList;
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    return (
      <div>
        <div className="mt-4 container max-width-40">
          <div className="p-4 border border-secondary rounded mb-3">
            <div>
              <h5>
                <Trans i18nKey="searchPostalCode.country" />
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
              <DropdownField fieldName='country' i18nKey='searchPostalCode.country' placeholder='All Countries' labelClassName="mb-2" dropdownClassName="mb-2" disableLabel={true} onChange={(e) => this.handleDropdownChange(e, 'country')} renderItems={this.renderCountry()} />
            </div>

            <div className="mt-2">
              <h5>
                <Trans i18nKey="searchPostalCode.postalCode" />
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
                <input
                  type="text"
                  name="postalCode"
                  className="form-control"
                  placeholder={this.props.t("searchPostalCode.searchPostalCodePlaceholder")}
                  onChange={this.handleOnChange.bind(this)}
                  onKeyUp={this.handleKeyUp.bind(this)} />
              </div>
            </div>

            {
              this.state.loading ?
                <div className="alert alert-warning text-center w-100 m-0" role="alert"><Trans i18nKey="searchPostalCode.loading" /></div>
                :
                null
            }

            {
              this.state.secretKey.length > 0 && this.state.postalCode && this.state.country && !this.state.loading ?
                <div onClick={this.handleSubmit}>
                  <button
                    type="button"
                    className="w-100 btn btn-lg btn-success">
                    <Trans i18nKey="searchPostalCode.searchPostalCodeButton" />
                  </button>
                </div>
                :
                <div onClick={this.handleSubmit}>
                  <button
                    type="button"
                    className="w-100 btn btn-lg btn-secondary"
                    disabled={true}>
                    <Trans i18nKey="searchPostalCode.searchPostalCodeButton" />
                  </button>
                </div>
            }
          </div>

          {this.renderPostalCodeList()}
        </div>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails, order, searchPostalCode }) {
  return ({
    error: searchPostalCode.error,
    shipperDetails: shipperDetails.shipperDetails,
    countries: order.countries,
    postalSearch: searchPostalCode.postalSearch,
    lastUpdated: searchPostalCode.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchAllCountries,
    fetchPostalSearch,
    clearSearchPostalCodeErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(SearchPostalCode);
