import React, { Component } from 'react';
import { connect } from 'react-redux';
import { history } from "../../utils/historyUtils";

export default function(ComposedComponent) {
  class Authentication extends Component {
    componentDidMount() {
      if (!this.props.authenticated) {
        if (this.props.location.pathname.includes('shopify-order')) {
          history.push({
            pathname: '/signin-shopify',
            search: this.props.location.search,
          })
        } else {
          history.push('/signin');
        }
      }
    }

    componentDidUpdate(nextProps) {
      if (!nextProps.authenticated) {
        if (this.props.location.pathname.includes('shopify-order')) {
          history.push({
            pathname: '/signin-shopify',
            search: this.props.location.search,
          })
        } else {
          history.push('/signin');
        }
      }
    }

    render() {
      return <ComposedComponent {...this.props} />
    }
  }

  function mapStateToProps(state) {
    return {
      authenticated: state.auth.authenticated
    };
  }

  return connect(mapStateToProps)(Authentication);
}
