import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchStore,
  clearStoreErrors
} from '../../actions/storeActions';

import ListContainer from '../common/ListContainer'

class Stores extends Component {
  constructor() {
    super();
    this.state = {
      errorData: null,
      fetched: false
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
  }

  componentWillUnmount() {
    this.props.clearStoreErrors();
  }

  componentDidUpdate() {
    if (this.props.shipperDetails !== undefined && !this.state.fetched) {
      this.props.fetchStore(this.props.shipperDetails.agent_application_secret_key);
      this.setState({
        fetched: true
      });
    }

    if (this.props.errorData !== this.state.errorData) {
      this.setState({
        errorData: this.props.errorData
      });
    }
  }

  renderStores = () => {
    return _.map(this.props.stores, (item, i) => {
      const isActive = item.is_active;
      if (isActive) {
        return <ListContainer key={i} link={'/web-stores/' + item.store_id} text={item.store_name} />;
      }
    });
  }

  render() {
    let renderDiv = null;
    if (this.props.stores === undefined) {
      renderDiv = <div className="mt-5" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <ClipLoader
            color={'#273272'}
            loading={true}
          />
        </div>
      </div>;

      if (this.state.errorData) {
        renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
          <div className="alert alert-danger text-center m-0" role="alert">
            {this.state.errorData}
          </div>
          <LinkContainer to="/add-web-store">
            <button type="button" className="mt-2 mb-3 btn btn-lg btn-success float-right"><Trans i18nKey="stores.addWebStore" /></button>
          </LinkContainer>
        </div>;
      }
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
        {this.renderStores()}
        <LinkContainer to="/view-web-store-orders">
          <button type="button" className="mt-2 mb-3 btn btn-lg btn-secondary float-right"><Trans i18nKey="stores.manageWebStoreOrders" /></button>
        </LinkContainer>
        <LinkContainer to="/add-web-store">
          <button type="button" className="mt-2 mb-3 mr-2 btn btn-lg btn-success float-right"><Trans i18nKey="stores.addWebStore" /></button>
        </LinkContainer>
      </div>;
    }

    return (
      <div>
        {renderDiv}
      </div>
    )
  }
}

function mapStateToProps({ shipperDetails, store }) {
  return ({
    shipperDetails: shipperDetails.shipperDetails,
    stores: store.stores,
    errorData: store.errorData
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchStore,
    clearStoreErrors
  }),
  withNamespaces('common')
)(Stores);
