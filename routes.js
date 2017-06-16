'use strict';

const Controllers = require('keyfob').load({ path: './controllers', fn: require });


module.exports = [
  { method: 'GET', path: '/', handler: Controllers.home.get },

  // Client auto-configuration
  { method: 'POST', path: '/config/user', config: Controllers.config.user },
  { method: 'POST', path: '/config/guest', config: Controllers.config.guest},
  { method: 'POST', path: '/config/bot', config: Controllers.config.bot },

  // Fetch ICE servers
  // { method: 'POST', path: '/ice-servers', config: Controllers.ice },

  // Telemetry
  { method: 'POST', path: '/telemetry/client', config: Controllers.telemetry.client },
  { method: 'POST', path: '/telemetry/prosody', config: Controllers.telemetry.prosody },

  // Internal routes for Prosody authentication integration
  { method: 'GET', path: '/auth/user', config: Controllers.auth.user },
  { method: 'GET', path: '/auth/guest', config: Controllers.auth.guest },
  { method: 'GET', path: '/auth/bot', config: Controllers.auth.bot }
]

