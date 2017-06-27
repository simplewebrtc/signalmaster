const Config = require('getconfig');
const JWT = require('jsonwebtoken');
const Boom = require('boom');

const DevLicensing = require('../scripts/dev-license-gen');


const PROD_PUBLIC_KEY = '';
const DEV_PUBLIC_KEY = DevLicensing.DEV_PUBLIC_KEY;


const PUBLIC_KEY = Config.isDev ? DEV_PUBLIC_KEY : PROD_PUBLIC_KEY;
const ISSUER = Config.isDev ? 'licenses-dev.talky.io' : 'licenses.talky.io';



module.exports = function () {
  let license = Config.talky.license;

  return new Promise((resolve, reject) => {
    if (Config.isDev) {
      if (!license) {
        license = DevLicensing.createLicense({});
      }
      if (typeof license !== "string") {
        license = DevLicensing.createLicense(license);
      }
    }
  
    JWT.verify(license, PUBLIC_KEY, {
      algorithms: [ 'RS256' ],
      issuer: ISSUER
    }, (err, decoded) => {
      if (err) {
        let message = 'Could not verify Talky Core license';
        switch (err.message) {
          case 'invalid signature':
            message = 'Invalid Talky Core license';
            break;
          case 'jwt expired':
            message = 'Talky Core license has expired';
            break;
        }
        return reject(Boom.forbidden(message));
      }
      resolve(decoded);
    });
  });
};

