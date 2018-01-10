'use strict';

const register = function (server) {

  server.ext('onRequest', (request, h) => {

    if (request.headers.authorization) {
      let [tokenType, token] = request.headers.authorization.split(/\s+/);
      if (!token) {
        token = tokenType;
        tokenType = 'Bearer';
        request.headers.authorization = `${tokenType} ${token}`;
      }
    }
    return h.continue;
  });
};

module.exports = {
  register,
  name: 'jwt-authorization-fix'
};
