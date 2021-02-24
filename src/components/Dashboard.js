import React, { Component } from "react";
import { LinkContainer } from 'react-router-bootstrap';
import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces, Trans } from 'react-i18next';
import _ from 'lodash';
import { history } from "../utils/historyUtils";

import { fetchShipperDetails } from '../actions/shipperDetailsActions';
import { signoutUser } from "../actions/authActions";

import img from '../images/Janio-logo-reverse.svg';
import 'normalize.css/normalize.css';
import '../style/bootstrap.global.scss';
import '../style/style.scss';
import 'antd/lib/style/core/index.less';

let drawerWidth = 250;
if (window.innerWidth > 300 && window.innerWidth < 1000) {
  drawerWidth = 260;
} else if (window.innerWidth > 1000) {
  drawerWidth = 250;
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    background: 'white',
  },
  appBar: {
    position: 'fixed',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    color: '#FFF',
    background: '#050593',
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
      height: window.innerHeight,
      overflow: 'auto',
    },
    background: 'white',
  },
  content: {
    flexGrow: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    overflow: 'auto',
    backgroundColor: 'white',
    padding: theme.spacing.unit * 3,
  },
});

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      mobileOpen: false,
      changedLanguage: false
    };
  }

  componentDidMount() {
    if (this.props.shipperDetails === undefined) {
      this.props.fetchShipperDetails();
    }
    this.setSideBarLogo();
  }

  componentDidUpdate() {
    this.props.history.listen((location, action) => {
      this.setState({
        mobileOpen: false
      });
    });

    if (window.innerWidth > 1000) {
      this.setSideBar();
    }

    if (this.props.shipperDetails !== undefined && !this.state.changedLanguage) {
      const language = this.props.shipperDetails.language;

      const { i18n } = this.props;
      i18n.changeLanguage(language);

      this.setState({
        changedLanguage: true
      });
    }
  }

  setSideBarLogo = () => {
    const navBarTitle = document.querySelector('#navBarTitle');
    if (navBarTitle !== null) {
      if (window.innerHeight < 650) {
        const body = document.querySelector('body');
        body.setAttribute('style', 'overflow: hidden;');
      }

      // logoDiv
      const logoDiv = navBarTitle.parentElement.parentElement.nextSibling.firstChild.firstChild.firstChild.childNodes[0];
      logoDiv.setAttribute('style', 'background: #050593; z-index: 100;');
      if (!logoDiv.getAttribute('class').includes(' d-flex justify-content-center align-items-center')) {
        logoDiv.setAttribute('class', logoDiv.getAttribute('class') + ' d-flex justify-content-center align-items-center');
      }
      if (logoDiv.firstChild === null) {
        const imgDiv = document.createElement("img");
        imgDiv.setAttribute('src', img);
        imgDiv.setAttribute('width', '50%');
        imgDiv.setAttribute('height', '100%');
        logoDiv.appendChild(imgDiv);
      }
    }
  }

  setSideBar = () => {
    const navBarTitle = document.querySelector('#navBarTitle');
    if (navBarTitle !== null) {
      // sideBar
      const sideBar = navBarTitle.parentElement.parentElement.nextSibling.firstChild.firstChild.firstChild.childNodes[1];
      // if (sideBar !== undefined) {
      //   sideBar.setAttribute('style', 'margin-top: 25%;');
      // }
    }
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleLogout = () => {
    this.props.signoutUser(history);
  }

  renderNavBarTitle = () => {
    let navBarTitle = <div id="navBarTitle" className="mr-auto">
      <span className="h5">
        {this.changeNavBarTitle(null)}
      </span>
    </div>;

    if (this.props.shipperDetails !== undefined) {
      const language = this.props.shipperDetails.language;

      if (!_.isEmpty(language)) {
        navBarTitle = <div id="navBarTitle" className="mr-auto">
          <span className="h5">
            {this.changeNavBarTitle(language)}
          </span>
        </div>;
      }
    }

    return navBarTitle;
  }

  changeNavBarTitle = (language) => {
    let title = this.props.t('navbarTitle.dashboard');

    const pathname = history.location.pathname;
    if (!_.isEmpty(language)) {
        title = this.props.t('navbarTitle.dashboard');
        if (pathname.includes('/user')) {
          title = this.props.t('navbarTitle.userSettings');
        } else if (pathname.includes('/change-password')) {
          title = this.props.t('navbarTitle.changePassword');
        } else if (pathname.includes('/sub-profiles')) {
          title = this.props.t('navbarTitle.manageTeam');
        } else if (pathname.includes('/add-sub-profile')) {
          title = this.props.t('navbarTitle.addTeamMember');
        } else if (pathname.includes('/view-sub-profile')) {
          title = this.props.t('navbarTitle.viewTeamMember');
        } else if (pathname.includes('/merchant-details')) {
          title = this.props.t('navbarTitle.companyDetails');
        } else if (pathname.includes('/connect-a-store')) {
          title = this.props.t('navbarTitle.connectAStore');
        } else if (pathname.includes('/add-pickup-point')) {
          title = this.props.t('navbarTitle.addPickup');
        } else if (pathname.includes('/pickup-points')) {
          title = this.props.t('navbarTitle.pickup');
        } else if (pathname.includes('/search-postal-code')) {
          title = this.props.t('navbarTitle.searchPostalCode');
        } else if (pathname.includes('/submit-order') && pathname.length <= 14) {
          title = this.props.t('navbarTitle.submitSingleOrder');
        } else if (pathname.includes('/submit-order-csv') && pathname.length <= 18) {
          title = this.props.t('navbarTitle.submitBulkOrders');
        }else if (pathname.includes('/submit-order-csv-2')) {
          title = this.props.t('navbarTitle.submitBulkOrders');
        }else if (pathname.includes('/submit-shopify-orders')) {
          title = 'Submit Shopify Orders';
          title = this.props.t('navbarTitle.submitShopifyOrders');
        } else if (pathname.includes('/view-orders')) {
          title = this.props.t('navbarTitle.manageOrders');
        } else if (pathname.includes('/view-order-details')) {
          title = this.props.t('navbarTitle.viewOrderDetails');
        } else if (pathname.includes('/view-item-details')) {
          title = this.props.t('navbarTitle.viewItemDetails');
        } else if (pathname.includes('/add-item-details')) {
          title = this.props.t('navbarTitle.addItemDetails');
        } else if (pathname.includes('/add-web-store')) {
          title = this.props.t('navbarTitle.addWebStore');
        } else if (pathname.includes('/web-stores')) {
          title = this.props.t('navbarTitle.connectAStore');
        } else if (pathname.includes('/view-web-store-orders')) {
          title = this.props.t('navbarTitle.manageWebStoreOrders');
        } else if (pathname.includes('/view-web-store-order-details')) {
          title = this.props.t('navbarTitle.viewWebStoreOrderDetails');
        } else if (pathname.includes('/reports')) {
          title = this.props.t('navbarTitle.reports');
        } else if (pathname.includes('/invoices')) {
          title = this.props.t('navbarTitle.billingAndInvoices');
        } else if (pathname.includes('/analytics')) {
          title = this.props.t('navbarTitle.analytics');
        } else if (pathname.includes('/shopify-order')) {
          title = this.props.t('navbarTitle.createShipment');
        } else if (pathname.includes('/configure-default-values')) {
          title = this.props.t('navbarTitle.configureDefaultValues');
        }
    }

    return title;
  }

  renderLogoutButton = () => {
    let logoutButton = <div className="pointer" style={{ color: '#FFF' }} onClick={this.handleLogout}>{this.getLogoutLabel(null)}</div>;

    if (this.props.shipperDetails !== undefined) {
      const language = this.props.shipperDetails.language;

      if (!_.isEmpty(language)) {
        logoutButton = <div className="pointer" style={{ color: '#FFF' }} onClick={this.handleLogout}>{this.getLogoutLabel(language)}</div>;
      }
    }

    return logoutButton;
  }

  getLogoutLabel = (language) => {
    let label = 'LOGOUT';

    if (!_.isEmpty(language)) {
      if (language === 'eng') {
        label = this.getLabelStr(label, language, 'LOGOUT', 'LOGOUT FROM ');
      } else if (language === 'chi') {
        label = this.getLabelStr(label, language, '登出', ' 登出');
      } else if (language === 'ind') {
        label = this.getLabelStr(label, language, 'KELUAR', ' KELUAR');
      }
    }

    return label;
  }

  getLabelStr = (labelStr, language, str, str2) => {
    if (this.props.shipperDetails !== undefined) {
      const shipperName = this.props.shipperDetails.shipper_name;
      if (!_.isEmpty(shipperName)) {
        if (window.innerWidth > 300 && window.innerWidth < 1000) {
          labelStr = str;
        } else if (window.innerWidth > 1000) {
          labelStr = `${language === 'eng' ? str2 + shipperName : shipperName + str2}`;
        }
      }
    }

    return labelStr;
  }

  renderSideBar = () => {
    let sideBar = null;

    if (this.props.shipperDetails !== undefined) {
      const privilege = this.props.shipperDetails.privilege;

      if (privilege === 'admin') {
        sideBar = <div>
          <LinkContainer className={window.location.pathname.endsWith('/') && window.location.pathname.length === 1 ? 'side-bar-selected-color' : null} to="/"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-home ml-3 mr-2"></i> <Trans i18nKey="sideBars.home" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/submit-order') || window.location.pathname.endsWith('/submit-order/') ? 'side-bar-selected-color' : null} to="/submit-order"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitSingleOrder" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/submit-order-csv') || window.location.pathname.endsWith('/submit-order-csv/') ? 'side-bar-selected-color' : null} to="/submit-order-csv"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitBulkOrders" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/submit-shopify-orders') || window.location.pathname.endsWith('/submit-shopify-orders/') ? 'side-bar-selected-color' : null} to="/submit-shopify-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitShopifyOrders" /></span></List></LinkContainer>*/}
          <LinkContainer className={window.location.pathname.endsWith('/view-orders') || window.location.pathname.endsWith('/view-orders/') ? 'side-bar-selected-color' : null} to="/view-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.manageOrders" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/configure-default-values') || window.location.pathname.endsWith('/configure-default-values/') ? 'side-bar-selected-color' : null} to="/configure-default-values"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.configureDefaultValues" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/view-item-details') || window.location.pathname.endsWith('/view-item-details/') ? 'side-bar-selected-color' : null} to="/view-item-details"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.viewAllItemDetails" /></span></List></LinkContainer>*/}
          {/* <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/web-stores') || window.location.pathname.endsWith('/web-stores/') ? 'side-bar-selected-color' : null} to="/web-stores"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-store ml-3 mr-2"></i> <Trans i18nKey="sideBars.connectAStore" /></span></List></LinkContainer> */}
          {/*<LinkContainer className={window.location.pathname.endsWith('/view-web-store-orders') || window.location.pathname.endsWith('/view-web-store-orders/') ? 'side-bar-selected-color' : null} to="/view-web-store-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.manageWebStoreOrders" /></span></List></LinkContainer>*/}
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/reports') || window.location.pathname.endsWith('/reports/') ? 'side-bar-selected-color' : null} to="/reports"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-file-alt ml-3 mr-2"></i> <Trans i18nKey="sideBars.reports" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/invoices') || window.location.pathname.endsWith('/invoices/') ? 'side-bar-selected-color' : null} to="/invoices"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-file-alt ml-3 mr-2"></i> <Trans i18nKey="sideBars.billingAndInvoices" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/pickup-points') || window.location.pathname.endsWith('/pickup-points/') ? 'side-bar-selected-color' : null} to="/pickup-points"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-bag ml-3 mr-2"></i> <Trans i18nKey="sideBars.pickup" /></span></List></LinkContainer>
          <Divider />
          <List className="pointer" onClick={this.handleClick}>
            <span className="side-bar-font-size"><i className="fas fa-sm fa-cog ml-3 mr-2"></i> <Trans i18nKey="sideBars.account" /></span>
            {this.state.open ? <ExpandLess className="float-right" /> : <ExpandMore className="float-right" />}
          </List>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <LinkContainer className={window.location.pathname.endsWith('/user') || window.location.pathname.endsWith('/user/') ? 'side-bar-selected-color' : null} to="/user"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-user ml-3 mr-2"></i> <Trans i18nKey="sideBars.user" /></span></List></LinkContainer>
              {/*<LinkContainer className={window.location.pathname.endsWith('/change-password') || window.location.pathname.endsWith('/change-password/') ? 'side-bar-selected-color' : null} to="/change-password"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-unlock ml-3 mr-2"></i> <Trans i18nKey="sideBars.changePassword" /></span></List></LinkContainer>*/}
              <LinkContainer className={window.location.pathname.endsWith('/sub-profiles') || window.location.pathname.endsWith('/sub-profiles/') ? 'side-bar-selected-color' : null} to="/sub-profiles"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-users ml-3 mr-2"></i> <Trans i18nKey="sideBars.manageTeam" /></span></List></LinkContainer>
              <LinkContainer className={window.location.pathname.endsWith('/merchant-details') || window.location.pathname.endsWith('/merchant-details/') ? 'side-bar-selected-color' : null} to="/merchant-details"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-truck ml-3 mr-2"></i> <Trans i18nKey="sideBars.companyDetails" /></span></List></LinkContainer>
              <LinkContainer className={window.location.pathname.endsWith('/connect-a-store') || window.location.pathname.endsWith('/connect-a-store/') ? 'side-bar-selected-color' : null} to="/connect-a-store"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-store-alt ml-3 mr-2"></i> <Trans i18nKey="sideBars.connectToStore" /></span></List></LinkContainer>
              {/*<LinkContainer className={window.location.pathname.endsWith('/search-postal-code') || window.location.pathname.endsWith('/search-postal-code/') ? 'side-bar-selected-color' : null} to="/search-postal-code"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-search ml-3 mr-2"></i> <Trans i18nKey="sideBars.searchPostalCode" /></span></List></LinkContainer>*/}
            </List>
          </Collapse>
        </div>;
      } else if (privilege === 'manager') {
        sideBar = <div>
          <LinkContainer className={window.location.pathname.endsWith('/') && window.location.pathname.length === 1 ? 'side-bar-selected-color' : null} to="/"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-home ml-3 mr-2"></i> <Trans i18nKey="sideBars.home" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/submit-order') || window.location.pathname.endsWith('/submit-order/') ? 'side-bar-selected-color' : null} to="/submit-order"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitSingleOrder" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/submit-order-csv') || window.location.pathname.endsWith('/submit-order-csv/') ? 'side-bar-selected-color' : null} to="/submit-order-csv"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitBulkOrders" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/submit-shopify-orders') || window.location.pathname.endsWith('/submit-shopify-orders/') ? 'side-bar-selected-color' : null} to="/submit-shopify-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitShopifyOrders" /></span></List></LinkContainer>*/}
          <LinkContainer className={window.location.pathname.endsWith('/view-orders') || window.location.pathname.endsWith('/view-orders/') ? 'side-bar-selected-color' : null} to="/view-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.manageOrders" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/configure-default-values') || window.location.pathname.endsWith('/configure-default-values/') ? 'side-bar-selected-color' : null} to="/configure-default-values"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.configureDefaultValues" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/view-item-details') || window.location.pathname.endsWith('/view-item-details/') ? 'side-bar-selected-color' : null} to="/view-item-details"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.viewAllItemDetails" /></span></List></LinkContainer>*/}
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/reports') || window.location.pathname.endsWith('/reports/') ? 'side-bar-selected-color' : null} to="/reports"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-file-alt ml-3 mr-2"></i> <Trans i18nKey="sideBars.reports" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/analytics') || window.location.pathname.endsWith('/analytics/') ? 'side-bar-selected-color' : null} to="/analytics"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-chart-line ml-3 mr-2"></i> <Trans i18nKey="sideBars.analytics" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/invoices') || window.location.pathname.endsWith('/invoices/') ? 'side-bar-selected-color' : null} to="/invoices"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-file-alt ml-3 mr-2"></i> <Trans i18nKey="sideBars.billingAndInvoices" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/pickup-points') || window.location.pathname.endsWith('/pickup-points/') ? 'side-bar-selected-color' : null} to="/pickup-points"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-bag ml-3 mr-2"></i> <Trans i18nKey="sideBars.pickup" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/change-password') || window.location.pathname.endsWith('/change-password/') ? 'side-bar-selected-color' : null} to="/change-password"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-unlock ml-3 mr-2"></i> <Trans i18nKey="sideBars.changePassword" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/search-postal-code') || window.location.pathname.endsWith('/search-postal-code/') ? 'side-bar-selected-color' : null} to="/search-postal-code"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-search ml-3 mr-2"></i> <Trans i18nKey="sideBars.searchPostalCode" /></span></List></LinkContainer>*/}
        </div>;
      } else if (privilege === 'viewer') {
        sideBar = <div>
          <LinkContainer className={window.location.pathname.endsWith('/') && window.location.pathname.length === 1 ? 'side-bar-selected-color' : null} to="/"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-home ml-3 mr-2"></i> <Trans i18nKey="sideBars.home" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/view-orders') || window.location.pathname.endsWith('/view-orders/') ? 'side-bar-selected-color' : null} to="/view-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.manageOrders" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/view-item-details') || window.location.pathname.endsWith('/view-item-details/') ? 'side-bar-selected-color' : null} to="/view-item-details"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.viewAllItemDetails" /></span></List></LinkContainer>*/}
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/pickup-points') || window.location.pathname.endsWith('/pickup-points/') ? 'side-bar-selected-color' : null} to="/pickup-points"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-bag ml-3 mr-2"></i> <Trans i18nKey="sideBars.pickup" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/change-password') || window.location.pathname.endsWith('/change-password/') ? 'side-bar-selected-color' : null} to="/change-password"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-unlock ml-3 mr-2"></i> <Trans i18nKey="sideBars.changePassword" /></span></List></LinkContainer>
        </div>;
      } else if (privilege === 'creator') {
        sideBar = <div>
          <LinkContainer className={window.location.pathname.endsWith('/') && window.location.pathname.length === 1 ? 'side-bar-selected-color' : null} to="/"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-home ml-3 mr-2"></i> <Trans i18nKey="sideBars.home" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/submit-order') || window.location.pathname.endsWith('/submit-order/') ? 'side-bar-selected-color' : null} to="/submit-order"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitSingleOrder" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/submit-order-csv') || window.location.pathname.endsWith('/submit-order-csv/') ? 'side-bar-selected-color' : null} to="/submit-order-csv"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitBulkOrders" /></span></List></LinkContainer>
          <LinkContainer className={window.location.pathname.endsWith('/configure-default-values') || window.location.pathname.endsWith('/configure-default-values/') ? 'side-bar-selected-color' : null} to="/configure-default-values"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-list ml-3 mr-2"></i> <Trans i18nKey="sideBars.configureDefaultValues" /></span></List></LinkContainer>
          {/*<LinkContainer className={window.location.pathname.endsWith('/submit-shopify-orders') || window.location.pathname.endsWith('/submit-shopify-orders/') ? 'side-bar-selected-color' : null} to="/submit-shopify-orders"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-cart ml-3 mr-2"></i> <Trans i18nKey="sideBars.submitShopifyOrders" /></span></List></LinkContainer>*/}
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/pickup-points') || window.location.pathname.endsWith('/pickup-points/') ? 'side-bar-selected-color' : null} to="/pickup-points"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-shopping-bag ml-3 mr-2"></i> <Trans i18nKey="sideBars.pickup" /></span></List></LinkContainer>
          <Divider />
          <LinkContainer className={window.location.pathname.endsWith('/change-password') || window.location.pathname.endsWith('/change-password/') ? 'side-bar-selected-color' : null} to="/change-password"><List className="pointer"><span className="side-bar-font-size"><i className="fas fa-sm fa-unlock ml-3 mr-2"></i> <Trans i18nKey="sideBars.changePassword" /></span></List></LinkContainer>
        </div>;
      }
    }

    return sideBar;
  }

  render() {
    const { classes, theme } = this.props;
    console.log({ classes })

    const drawer = (
      <div>
        <div className={classes.toolbar} />
        {this.renderSideBar()}
        <div className="d-flex flex-column justify-content-center align-items-center mt-5">
          <label><Trans i18nKey="sideBars.clientSupport"/></label>
          <a href={"mailto: clientsupport@janio.asia"}>clientsupport@janio.asia</a>
        </div>
      </div>
    );

    const pathname = window.location.pathname
    const isShopify = pathname.startsWith('/shopify-order')

    return (
      <div className={classes.root}>
        {!isShopify &&
        <>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
              className={classes.navIconHide}
            >
              <MenuIcon />
            </IconButton>
            {this.renderNavBarTitle()}
            {this.renderLogoutButton()}
          </Toolbar>
        </AppBar>
        <Hidden mdUp>
          <SwipeableDrawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            onOpen={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </SwipeableDrawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        </>
        }
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.props.children}
        </main>
      </div>
    );
  }
}

function mapStateToProps({ shipperDetails }) {
  return {
    shipperDetails: shipperDetails.shipperDetails
  };
}

export default withRouter(compose(
  connect(mapStateToProps, {
    fetchShipperDetails,
    signoutUser
  }),
  withStyles(styles, { withTheme: true }),
  withNamespaces('common')
)(Dashboard));
