const express = require('express');
const fs = require("fs");
const app = express();
app.disable('x-powered-by');

const API_BASEROUTE = process.env.API_BASEROUTE ||'https://darkknight.cashstory.com/api/v1';
const URL_LANDING = process.env.URL_LANDING ||'https://cashstory.com';
const GTAG_ID = process.env.GTAG_ID || false;
const ENABLE_DEBUG = process.env.ENABLE_DEBUG || false;
const PRODUCTION = process.env.NODE_ENV || true;
const CRISP_WEBSITE_KEY = process.env.CRISP_WEBSITE_KEY || '';

const whitelist = API_BASEROUTE.split('//')[1].split('/')[0];
const basePath = `${__dirname}/dist/public`;

const respondCsParams = (req, res) => {
  res.set('Content-Type', 'application/javascript')
  return res.send(`(function (window) {
window.__env = window.__env || {};

// API url
window.__env.production = '${PRODUCTION}';
window.__env.api = '${API_BASEROUTE}';
window.__env.landingUrl = '${URL_LANDING}';
window.__env.gtm_id = '${GTAG_ID}';
window.__env.whitelistedDomains = ['${whitelist}'];
window.__env.crispWebsiteId = '${CRISP_WEBSITE_KEY}';

// Whether or not to enable debug mode
// Setting this to false will disable console output
window.__env.enableDebug = ${ENABLE_DEBUG};
}(this));`);
}

app.use('*', (req, res) => {
  const pathFile = `${basePath}/${decodeURIComponent(req.originalUrl)}`;
  if (req.originalUrl.indexOf('cs-params.js') > -1) {
    return respondCsParams(req, res);
  } else if (fs.existsSync(pathFile)) {
    return res.sendFile(pathFile);
  } else {
    return res.sendFile(`${basePath}/index.html`);
  }
});
app.listen((process.env.PORT || 8080));
