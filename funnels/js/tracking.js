function getSaleReferrer_Core(enable_fb_pixel) {
  if (enable_fb_pixel == "T") {
      var tmp = window.localStorage.getItem("DSVSaleReferer");
      var data = null;
      var res = "F";
      if (tmp) {
          try {
              data = Base64.decode(tmp);
              data = JSON.parse(data);
          } catch (e) {}
      }
      console.log("data", data);
      if (data == null) {
          res = "T";
      }
      return res;
  } else {
      return enable_fb_pixel;
  }
}
var STATUS_VIEW_ALL_CONTENT = false;
var PAGE_MODE = 'sellpage';
var BASE_API = 'https://api.taximail.com/';
var SLUG_PAGE = 'promotions';
var BASE_URL_AWS = 'https://cdn.taximail.com/asset/';
var GEN_KEY = 'f122cdf0-7233-11ea-9e76-63e2e0b17cce';
var LEAD_FORM_CONFIG = '{"require_email":"T","require_tel":"F","enable_address":"T","enable_facebook":"T","enable_line":"T","enable_otp":"F","enable_twitter":"T"}';
var FILE_VERSION = '54';
var MINIMUM_COD = '100';
var ENABLED_COD = 'F';
var ENABLED_OMISE = 'F';
var PIXEL_ID = "229585108237625";
var ENABLE_FB_PIXEL = getSaleReferrer_Core("T");
var BASE_FRONT_URL = 'https://cdn.taximail.com/funnels/';
var BASE_MANAGER_LEAD_URL = '404.html';