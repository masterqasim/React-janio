// demo
export let ROOT_URL = "https://janio-api-demo.herokuapp.com/api";
export let ENV_MODE = "demo";
export let JANIO_LABEL_URL = "https://janio-label-demo.herokuapp.com";
export let JANIO_TRACKER_URL = "https://janio-tracker-demo.herokuapp.com";

const url = window.location.href;
if (process.env.REACT_APP_IS_LOCAL) {
  ROOT_URL = "http://merchant.janio.local/api";
} else if (process.env.REACT_APP_IS_STAGING) {
  ROOT_URL = "https://merchant.staging.janio.asia/api";
} else if (process.env.REACT_APP_IS_INTEGRATION) {
  ROOT_URL = "https://merchant.int.janio.asia/api";
} else if (process.env.REACT_APP_IS_PRODUCTION) {
  ROOT_URL = "https://merchant.janio.asia/api";
} else if (process.env.REACT_APP_IS_PRODUCTION_CN) {
  ROOT_URL = "https://merchant.janio.cn/api";
} else {
  if (
    url.includes("janio-shipper.herokuapp.com") ||
    url.includes("merchant.janio.asia") ||
    url.includes("merchant-cn.janio.asia")
  ) {
    ROOT_URL = "https://janio-api.herokuapp.com/api";
    JANIO_LABEL_URL = "https://label.janio.asia";
    JANIO_TRACKER_URL = "https://tracker.janio.asia";
    ENV_MODE = "production";
  } else if (url.includes("janio-shipper-int.herokuapp.com")) {
    ROOT_URL = "https://janio-api-int.herokuapp.com/api";
    ENV_MODE = "int";
  } else if (url.includes("localhost")) {
    ROOT_URL = "https://8870add5.ngrok.io/api" //"http://localhost:8000/api";
    ENV_MODE = "local";
  }
}
