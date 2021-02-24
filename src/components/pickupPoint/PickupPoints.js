import React, { Component } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import _ from 'lodash';
import compose from 'recompose/compose';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchPickupPoint } from '../../actions/pickupPointActions';

import ListContainer from '../common/ListContainer'

class PickupPoints extends Component {
  constructor() {
    super();
    this.state = {

    };
  }

  componentDidMount() {
    this.props.fetchPickupPoint();
  }

  renderPickupPoints = () => {
    return _.map(this.props.pickupPoints, (item, i) => {
      return (
        <ListContainer key={i} link={'/pickup-points/' + item.pickup_point_id} text={item.pickup_point_name} />
      )
    });
  }

  render() {
    let renderDiv = null;
    if (this.props.pickupPoints === undefined) {
      renderDiv = <div className="mt-5" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <ClipLoader
            color={'#273272'}
            loading={true}
          />
        </div>
      </div>;
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px' }}>
        {this.renderPickupPoints()}
        <LinkContainer to="/add-pickup-point">
          <button id="addPickupPointButton" type="button" className="mb-3 btn btn-lg btn-success float-right"><Trans i18nKey="pickupPoints.addPickup" /></button>
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

function mapStateToProps({ pickupPoint }) {
  return ({
    pickupPoints: pickupPoint.pickupPoints
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchPickupPoint
  }),
  withNamespaces('common')
)(PickupPoints);
