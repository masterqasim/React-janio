import React, { Component } from "react";
import { history } from "../utils/historyUtils";

import Dashboard from "./Dashboard";

class App extends Component {
  renderDashboard = () => {
    let dashboard = (
      <div style={{height: "100%"}}>
        {this.props.children}
      </div>
    )

    const pathname = window.location.pathname;
    if (
      !pathname.startsWith("/signin") &&
      !pathname.startsWith("/signin-shopify") &&
      !pathname.startsWith("/register/success") &&
      !pathname.startsWith("/register") &&
      !pathname.startsWith("/password-sent/") &&
      !pathname.startsWith("/reset-password/success") &&
      !pathname.startsWith("/reset-password") &&
      !pathname.startsWith("/consignee-customs-document")
    ) {
      dashboard = (
        <Dashboard children={this.props.children} history={history} />
      );
    }

    return dashboard;
  };

  render() {
    return this.renderDashboard();
  }
}
export default App;
