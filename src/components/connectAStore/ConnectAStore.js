import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import shopifyLogo from "../../images/shopify_logo_black.svg";
import {
  fetchShopifyShops,
  postShopifyUrl
} from "../../actions/submitShopifyOrdersActions";

function ConnectAStore(props) {
  const [showShopifyForm, setShowShopifyForm] = useState(false);
  const [domain, setDomain] = useState("");
  const [secretKey, setSecretKey] = useState();

  if (
    !secretKey &&
    props.shipperDetails &&
    props.shipperDetails.agent_application_secret_key
  ) {
    setSecretKey(props.shipperDetails.agent_application_secret_key);
    props.fetchShopifyShops(props.shipperDetails.agent_application_secret_key);
  }

  function handleSubmit(e) {
    e.preventDefault();
    redirectToShopify(domain);
    return false;
  }

  function redirectToShopify(params) {
    postShopifyUrl(params, secretKey)
      .then(response => {
        console.log(response);
        if (response.status == 200) {
          window.location = response.data.redirect_url;
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <div className="container">
      {!showShopifyForm && (
        <div className="row justify-content-md-center">
          <div className="col-md-auto">
            <div className="font-weight-bold">Select a store to connect</div>
            <div className="store-img-wrapper">
              <img
                style={{ height: "50px" }}
                src={shopifyLogo}
                onClick={() => setShowShopifyForm(true)}
              />
            </div>
          </div>
        </div>
      )}

      {showShopifyForm && (
        <>
          <div className="row justify-content-md-center">
            <div className="col-md-auto">
              <div className="card">
                <div className="card-body">
                  <div>
                    <label className="font-weight-bold">Shopify Name</label>
                    <i className="far fa-sm fa-question-circle ml-2"></i>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group row ml-0 mr-0">
                        <div className="pr-2">
                          <input
                            type="text"
                            className="form-control"
                            id="domaininput"
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                          />
                        </div>
                        <label
                          htmlFor="domaininput"
                          className="col-form-label pl-0"
                        >
                          .myshopify.com
                        </label>
                      </div>
                      {domain.length > 70 && (
                        <p className="text-danger">
                          You have exceeded the 70 character limit
                        </p>
                      )}
                      <button
                        type="submit"
                        className={
                          domain.length > 0
                            ? "btn btn-success w-100"
                            : "btn btn-secondary w-100"
                        }
                        disabled={domain.length === 0 || domain.length > 70}
                      >
                        Connect
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="w-100 mt-5 container max-width-40">
              {props.shopifyShops &&
                props.shopifyShops.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className="alert alert-secondary text-center pointer"
                      onClick={() => redirectToShopify(item.name)}
                    >
                      {item.name}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    shipperDetails: state.shipperDetails.shipperDetails,
    shopifyShops: state.submitShopifyOrders.shopifyShops
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchShopifyShops: secretKey => dispatch(fetchShopifyShops(secretKey))
  };
}

export default withRouter(
  compose(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )
  )(ConnectAStore)
);
