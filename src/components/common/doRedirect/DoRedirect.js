import React, { Component } from "react";
import HttpsRedirect from 'react-https-redirect';
import {connect} from "react-redux";

class DoRedirect extends Component {
    render() {
        if (process.env.REACT_APP_IS_LOCAL || process.env.REACT_APP_IS_STAGING || process.env.REACT_APP_IS_INTEGRATION || process.env.REACT_APP_IS_PRODUCTION || process.env.REACT_APP_IS_PRODUCTION_CN) {
            return this.props.children
        } else {
            return(
                <HttpsRedirect>{this.props.children}</HttpsRedirect>
            );
        }
    }
}

function mapStateToProps() {
    return ({});
}

export default connect(mapStateToProps, {})(DoRedirect);
