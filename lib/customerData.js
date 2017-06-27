const Config = require('getconfig');


module.exports = function (token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, Config.talky.apiKey, { algorithm: 'HS256' }, (err, customerData) => {
    
      if (err) {
        return reject();
      }
      reply(customerData);
    });
  });
};
