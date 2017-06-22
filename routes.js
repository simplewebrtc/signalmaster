'use strict';

const Controllers = require('keyfob').load({ path: './controllers', fn: require });


module.exports = [
  // Public routes for clients
  // ---------------------------------------------------------------------

  // Signaling
  { method: '*', path: '/ws-bind', config: Controllers.signaling },

  // Alternate connection discovery method for XMPP clients
  { method: 'GET', path: '/.well-known/host-meta.json', config: Controllers.hostmeta },

  // Client auto-configuration
  { method: 'GET', path: '/config/user', config: Controllers.config.user },
  { method: 'GET', path: '/config/guest', config: Controllers.config.guest},
  { method: 'GET', path: '/config/bot', config: Controllers.config.bot },

  // Fetch ICE servers
  { method: 'GET', path: '/ice-servers', config: Controllers.ice },

  // Telemetry
  { method: 'POST', path: '/telemetry', config: Controllers.telemetry.client },


  // Internal routes for Prosody 
  // ---------------------------------------------------------------------
 
  // Telemetry
  { method: 'POST', path: '/prosody/telemetry', config: Controllers.telemetry.prosody },

  // Authentication
  { method: 'GET', path: '/prosody/auth/user', config: Controllers.auth.user },
  { method: 'GET', path: '/prosody/auth/guest', config: Controllers.auth.guest },
  { method: 'GET', path: '/prosody/auth/bot', config: Controllers.auth.bot },

  // Room affiliations
  { method: 'POST', path: '/prosody/rooms/affiliation', config: Controllers.rooms.affiliation }
]

