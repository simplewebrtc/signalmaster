'use strict';

const Controllers = require('keyfob').load({ path: './controllers', fn: require });


module.exports = [
  // Signaling
  { method: 'GET', path: '/ws-bind', config: Controllers.signaling },

  // Alternate connection discovery method for XMPP clients
  { method: 'GET', path: '/.well-known/host-meta.json', config: Controllers.hostmeta },

  // Fetch ICE servers
  { method: 'GET', path: '/ice', config: Controllers.ice.client },

  // Domain verificiation
  { method: 'GET', path: '/instance-check', config: Controllers.instance_check },

  // Client auto-configuration
  { method: 'POST', path: '/config/user/{orgId?}', config: Controllers.config.user },
  { method: 'POST', path: '/config/guest/{orgId?}', config: Controllers.config.guest },
  { method: 'POST', path: '/config/bot', config: Controllers.config.bot },
  { method: 'POST', path: '/prosody/config', config: Controllers.config.prosody },

  // Telemetry
  { method: 'POST', path: '/telemetry', config: Controllers.telemetry.client },


  // Web UI Routes
  // ---------------------------------------------------------------------

  { method: 'GET', path: '/', config: Controllers.home },
  { method: 'GET', path: '/setup', config: Controllers.setup },
  { method: 'GET', path: '/license', config: Controllers.license },
  { method: 'GET', path: '/dashboard', config: Controllers.dashboard.home },
  { method: 'GET', path: '/dashboard/histograms/{histogram_type}', config: Controllers.dashboard.histograms },
  { method: 'GET', path: '/dashboard/sessions/{id}', config: Controllers.dashboard.get_one_session },
  { method: 'GET', path: '/dashboard/rooms', config: Controllers.dashboard.get_list_of_rooms },
  { method: 'GET', path: '/dashboard/rooms/{id}', config: Controllers.dashboard.get_one_room },

  // Internal routes for ICE
  // ---------------------------------------------------------------------

  { method: 'POST', path: '/ice/telemetry', config: Controllers.telemetry.ice },

  // Internal routes for Prosody
  // ---------------------------------------------------------------------

  // Telemetry
  { method: 'POST', path: '/prosody/telemetry', config: Controllers.telemetry.prosody },

  // Legacy ICE requests
  { method: 'POST', path: '/prosody/ice', config: Controllers.ice.prosody },

  // Authentication
  { method: 'GET', path: '/prosody/auth/user', config: Controllers.auth.user },
  { method: 'GET', path: '/prosody/auth/guest', config: Controllers.auth.guest },
  { method: 'GET', path: '/prosody/auth/bot', config: Controllers.auth.bot },

  // Room affiliations
  { method: 'POST', path: '/prosody/rooms/affiliation', config: Controllers.rooms.affiliation },
  { method: 'POST', path: '/prosody/rooms/user-info', config: Controllers.rooms.user_info },


  // Static assets
  // ---------------------------------------------------------------------

  { method: 'GET', path: '/{path*}', config: { handler: { directory: { path: './public', listing: false } }, auth: false } }
];
