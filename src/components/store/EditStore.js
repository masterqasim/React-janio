import React, { Component } from 'react';
import { Jumbotron } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';
import { connect } from "react-redux";
import moment from 'moment';
import { history } from '../../utils/historyUtils';
import compose from 'recompose/compose';
// import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';

import { fetchShipperDetails } from '../../actions/shipperDetailsActions';
import {
  fetchStoreById,
  deleteStore,
  activateStore,
  deactivateStore,
  clearStoreErrors
} from '../../actions/storeActions';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class EditStore extends Component {
  constructor() {
    super();
    this.state = {
      error: true,
      errorData: null,
      status: null,
      anchorEl: null,

      lastUpdated: moment(),
      loadingForDeleteStore: false,
      loadingForActivateStoreOrDeactivateStore: false,
      updatedStatus: false,
      fetched: false,
      storeName: '',
    };
  }

  componentDidMount() {
    this.props.fetchShipperDetails();
  }

  componentDidUpdate() {
    if (this.state.status === 204) {
      history.push('/delete-web-store/success');
    }

    const { store } = this.props;
    if (store && !this.state.storeName) {
      this.setState({
        storeName: store.store_name,
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

    if (this.props.lastUpdated && this.state.lastUpdated) {
      if ((this.props.lastUpdated.valueOf() > this.state.lastUpdated.valueOf()) && this.state.loadingForDeleteStore) {
        this.setState({
          loadingForDeleteStore: false,
        });
      } else if ((this.props.lastUpdated.valueOf() > this.state.lastUpdated.valueOf()) && this.state.loadingForActivateStoreOrDeactivateStore) {
        this.setState({
          loadingForActivateStoreOrDeactivateStore: false
        });
      }
    }

    if (this.props.lastUpdated > this.state.lastUpdated) {
      this.setState({
        lastUpdated: this.props.lastUpdated
      });
    }

    if (this.props.shipperDetails !== undefined && !this.state.fetched) {
      const currentStoreId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
      this.props.fetchStoreById(currentStoreId, this.props.shipperDetails.agent_application_secret_key);
      this.setState({
        fetched: true
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

  handleDeleteStore = () => {
    this.props.clearStoreErrors();
    this.setState({
      loadingForDeleteStore: true
    });

    if (this.props.shipperDetails !== undefined) {
      const currentStoreId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
      this.props.deleteStore(currentStoreId, this.props.shipperDetails.agent_application_secret_key);
    }
  }

  handleActivateStore = () => {
    this.props.clearStoreErrors();
    this.setState({
      loadingForActivateStoreOrDeactivateStore: true
    });

    if (this.props.shipperDetails !== undefined) {
      const currentStoreId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
      this.props.activateStore(currentStoreId, this.props.shipperDetails.agent_application_secret_key);
    }
  }

  handleDeactivateStore = () => {
    this.props.clearStoreErrors();
    this.setState({
      loadingForActivateStoreOrDeactivateStore: true
    });

    if (this.props.shipperDetails !== undefined) {
      const currentStoreId = parseInt(window.location.href.substr(window.location.href.lastIndexOf('/') + 1), 10);
      this.props.deactivateStore(currentStoreId, this.props.shipperDetails.agent_application_secret_key);
    }
  }

  render() {
    // const { classes } = this.props;
    // const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);

    let renderDiv = null;
    if (this.props.store === undefined) {
      renderDiv = <div className="mt-5" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <ClipLoader
            color={'#273272'}
            loading={true}
          />
        </div>
      </div>;
    } else {
      renderDiv = <div className="w-100 mt-3 container max-width-40" style={{ padding: '10px'}}>
        <Jumbotron className="p-4 border border-secondary">
          <div className="form-group m-0">
            <h5>
              <Trans i18nKey="stores.storeName" />
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
            <input
            type="text"
            value={this.state.storeName}
            className="form-control"
            disabled={true} />
          </div>

          {
            this.state.loadingForDeleteStore ?
            <div className="alert alert-warning text-center m-0" role="alert"><Trans i18nKey="orders.loading" /></div>
            :
            null
          }

          {
            this.state.errorData ?
            <div className="alert alert-danger m-0" role="alert">
              <div><b><Trans i18nKey="orders.error" /></b></div>
              { JSON.stringify(this.state.errorData) }
            </div>
            :
            null
          }

          {
            this.state.status === 204 ?
            <div className="alert alert-success m-0" role="alert">
              <Trans i18nKey="stores.deleteStoreSuccess" />
            </div>
            :
            null
          }

          <button
          type="button"
          className="w-100 btn btn-lg btn-danger"
          onClick={this.handleDeleteStore}>
          <Trans i18nKey="stores.deleteStore" />
          </button>
        </Jumbotron>

        <Jumbotron className="p-4 border border-secondary">
          <div className="form-group">
            <div className="h5"><Trans i18nKey="stores.otherActions" /></div>

            {
              this.state.loadingForActivateStoreOrDeactivateStore ?
              <div className="alert alert-warning text-center m-0" role="alert"><Trans i18nKey="orders.loading" /></div>
              :
              null
            }

            {
              this.state.errorData ?
              <div className="alert alert-danger m-0" role="alert">
                <div><b><Trans i18nKey="orders.error" /></b></div>
                { JSON.stringify(this.state.errorData) }
              </div>
              :
              null
            }

            {
              this.state.status === 200 ?
              <div className="alert alert-success m-0" role="alert">
                { this.props.message }
              </div>
              :
              null
            }

            <button
            type="button"
            className="w-100 btn btn-lg btn-success"
            onClick={this.handleActivateStore}>
            <Trans i18nKey="stores.activateStore" />
            </button>

            <button
            type="button"
            className="w-100 btn btn-lg btn-danger"
            onClick={this.handleDeactivateStore}>
            <Trans i18nKey="stores.deactivateStore" />
            </button>
          </div>
        </Jumbotron>
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
    error: store.error,
    errorData: store.errorData,
    status: store.status,
    message: store.message,
    store: store.store,
    lastUpdated: store.lastUpdated
  });
}

export default compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    fetchStoreById,
    deleteStore,
    activateStore,
    deactivateStore,
    clearStoreErrors
  }),
  withStyles(styles),
  withNamespaces('common')
)(EditStore);
