import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { Router, Route, Switch } from "react-router-dom";
import reduxThunk from "redux-thunk";
import { history } from "./utils/historyUtils";
import Favicon from "react-favicon";
import ReactGA from "react-ga";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import commonEng from "./translations/eng/common.json";
import commonChi from "./translations/chi/common.json";
import commonCht from "./translations/cht/common.json";
import commonInd from "./translations/ind/common.json";

import App from "./components/app";
import RequireAuth from "./components/auth/RequireAuth";
import Signin from "./components/auth/Signin";
import SigninShopify from "./components/auth/SigninShopify";
import RegisterShopify from "./components/registerShopify/RegisterShopify";
import RegisterSuccess from "./components/register/RegisterSuccess";
import Register from "./components/register/Register";
import ResetPasswordSuccess from "./components/resetPassword/ResetPasswordSuccess";
import ResetPassword from "./components/resetPassword/ResetPassword";
import PasswordSent from "./components/resetPassword/PasswordSent";
import SubmitOrderCSV from "./components/order/SubmitOrderCSV";
import SubmitOrderSuccess from "./components/order/SubmitOrderSuccess";
import ViewOrders from "./components/order/ViewOrders";
import ViewOrderDetails from "./components/order/ViewOrderDetails";
import ViewItemDetails from "./components/itemDetails/ViewItemDetails";
import ViewItemDetailsById from "./components/itemDetails/ViewItemDetailsById";
import AddItemDetails from "./components/itemDetails/AddItemDetails";
import Reports from "./components/reports/Reports";
import Invoices from "./components/invoices/Invoices";
import User from "./components/user/User";
import ChangePassword from "./components/changePassword/ChangePassword";
import ViewSubProfile from "./components/subProfiles/ViewSubProfile";
import AddSubProfileSuccess from "./components/subProfiles/AddSubProfileSuccess";
import DeleteSubProfileSuccess from "./components/subProfiles/DeleteSubProfileSuccess";
import AddSubProfile from "./components/subProfiles/AddSubProfile";
import SubProfiles from "./components/subProfiles/SubProfiles";
import ShipperDetails from "./components/shipperDetails/ShipperDetails";
import ConnectAStore from "./components/connectAStore/ConnectAStore";
import AddPickupPointSuccess from "./components/pickupPoint/AddPickupPointSuccess";
import DeletePickupPointSuccess from "./components/pickupPoint/DeletePickupPointSuccess";
import AddPickupPoint from "./components/pickupPoint/AddPickupPoint";
import EditPickupPoint from "./components/pickupPoint/EditPickupPoint";
import PickupPoints from "./components/pickupPoint/PickupPoints";
import SearchPostalCode from "./components/searchPostalCode/SearchPostalCode";
import Stats from "./components/stats/Stats";
import DoRedirect from "./components/common/doRedirect/DoRedirect";
import reducers from "./reducers";
import { AUTH_USER } from "./actions/types";

// import registerServiceWorker from './registerServiceWorker';

import img from "./images/janio-favicon-new.png";
import ShopifyOrderContainer from "./components/shopifyOrders/ShopifyOrderContainer";
import ConfigureDefaultValues from "./components/configureDefaultValues/ConfigureDefaultValues";
import ConfigureDefaultValuesAdd from "./components/configureDefaultValues/ConfigureDefaultValuesAdd";
import ConfigureDefaultValuesEdit from "./components/configureDefaultValues/ConfigureDefaultValuesEdit";
import { fetchShipperDetails } from "./actions/shipperDetailsActions";

import OrderSubmitBulkPage from "./components/orderSubmitBulk/OrderSubmitBulk.page";
import ServiceDefSubmissionPage from "./components/orderSubmitBulk/serviceDefSubmission"
import CustomsDocumentPage from "./components/customsDocument/CustomsDocument.page";

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const token = localStorage.getItem("token");
const userId = localStorage.getItem("_id");
if (token && userId) {
  store.dispatch(fetchShipperDetails());
  store.dispatch({ type: AUTH_USER });
}

ReactGA.initialize("UA-122396409-1");
history.listen((location, action) => {
  ReactGA.pageview(window.location.pathname);
});

i18next.init({
  interpolation: { escapeValue: false },
  lng: "eng",
  fallbackLng: "eng",
  resources: {
    eng: {
      common: commonEng
    },
    chi: {
      common: commonChi
    },
    cht: {
      common: commonCht
    },
    ind: {
      common: commonInd
    }
  }
});

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18next}>
      <DoRedirect>
        <Favicon url={img} />
        <Router history={history}>
          <App>
            <Switch>
              <Route path="/signin" component={Signin} />
              <Route path="/signin-shopify" component={SigninShopify} />
              <Route path="/register-shopify" component={RegisterShopify} />
              <Route path="/register/success" component={RegisterSuccess} />
              <Route path="/register" component={Register} />
              <Route
                path="/password-sent/:resetToken"
                component={PasswordSent}
              />
              <Route
                path="/reset-password/success"
                component={ResetPasswordSuccess}
              />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/submit-order/success" component={RequireAuth(SubmitOrderSuccess)} />
              <Route path="/submit-order" component={RequireAuth(ShopifyOrderContainer)} />
              {/* <Route path="/submit-order-csv" component={RequireAuth(SubmitOrderCSV)} /> */}
              <Route path="/submit-order-csv" component={RequireAuth(ServiceDefSubmissionPage)} />
              {/* <Route path="/submit-order-csv" component={RequireAuth(OrderSubmitBulkPage)} /> */}
              <Route path="/view-order-details/:id" component={RequireAuth(ViewOrderDetails)} />
              <Route path="/view-orders" component={RequireAuth(ViewOrders)} />
              <Route
                path="/view-item-details/:id"
                component={RequireAuth(ViewItemDetailsById)}
              />
              <Route
                path="/view-item-details"
                component={RequireAuth(ViewItemDetails)}
              />
              <Route
                path="/add-item-details"
                component={RequireAuth(AddItemDetails)}
              />
              {/* <Route path="/add-web-store/success" component={RequireAuth(AddStoreSuccess)} /> */}
              {/* <Route path="/delete-web-store/success" component={RequireAuth(DeleteStoreSuccess)} /> */}
              {/* <Route path="/add-web-store" component={RequireAuth(AddStore)} /> */}
              {/* <Route path="/web-stores/:id" component={RequireAuth(EditStore)} /> */}
              {/* <Route path="/web-stores" component={RequireAuth(Stores)} /> */}
              {/* <Route path="/submit-store-order/success" component={RequireAuth(SubmitStoreOrderSuccess)} /> */}
              {/* <Route path="/view-web-store-order-details/:orderId/:storeId" component={RequireAuth(ViewStoreOrderDetails)} /> */}
              {/* <Route path="/view-web-store-orders" component={RequireAuth(ViewStoreOrders)} /> */}
              <Route path="/reports" component={RequireAuth(Reports)} />
              <Route path="/invoices" component={RequireAuth(Invoices)} />
              <Route path="/user" component={RequireAuth(User)} />
              <Route
                path="/change-password"
                component={RequireAuth(ChangePassword)}
              />
              <Route
                path="/view-sub-profile/:agentApplicationid/"
                component={RequireAuth(ViewSubProfile)}
              />
              <Route
                path="/add-sub-profile/success"
                component={RequireAuth(AddSubProfileSuccess)}
              />
              <Route
                path="/delete-sub-profile/success"
                component={RequireAuth(DeleteSubProfileSuccess)}
              />
              <Route
                path="/add-sub-profile"
                component={RequireAuth(AddSubProfile)}
              />
              <Route
                path="/sub-profiles"
                component={RequireAuth(SubProfiles)}
              />
              <Route
                path="/merchant-details"
                component={RequireAuth(ShipperDetails)}
              />
              <Route
                path="/connect-a-store"
                component={RequireAuth(ConnectAStore)}
              />
              <Route
                path="/add-pickup-point/success"
                component={RequireAuth(AddPickupPointSuccess)}
              />
              <Route
                path="/delete-pickup-point/success"
                component={RequireAuth(DeletePickupPointSuccess)}
              />
              <Route
                path="/add-pickup-point"
                component={RequireAuth(AddPickupPoint)}
              />
              <Route
                path="/pickup-points/:id"
                component={RequireAuth(EditPickupPoint)}
              />
              <Route
                path="/pickup-points"
                component={RequireAuth(PickupPoints)}
              />
              <Route
                path="/search-postal-code"
                component={RequireAuth(SearchPostalCode)}
              />
              <Route
                path="/shopify-order"
                component={RequireAuth(ShopifyOrderContainer)}
              />
              <Route
                path="/configure-default-values/:id/edit"
                component={RequireAuth(ConfigureDefaultValuesEdit)}
              />
              <Route
                path="/configure-default-values/add"
                component={RequireAuth(ConfigureDefaultValuesAdd)}
              />
              <Route
                path="/configure-default-values"
                component={RequireAuth(ConfigureDefaultValues)}
              />
              <Route
                path="/consignee-customs-document"
                component={CustomsDocumentPage}
              />
              <Route path="/" component={Stats} />
            </Switch>
          </App>
        </Router>
      </DoRedirect>
    </I18nextProvider>
  </Provider>,
  document.querySelector("#root")
);
// registerServiceWorker();
