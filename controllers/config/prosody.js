'use strict';

const Config = require('getconfig');

const InflateDomains = require('../../lib/domains');
const BuildInternalUrl = require('../../lib/build_internal_url');
const Domains = InflateDomains(Config.talky.domains);


module.exports = {
  description: 'Auto-configure a registered user client session',
  tags: ['api', 'config', 'prosody'],
  handler: async function (request, h) {

    const prosodyConfig = {
      modules_enabled: [
        'saslauth',
        'ping',
        'websocket',
        'log_slow_events',
        'talky_core_metrics',
        'talky_core_instance_check'
      ],

      talky_core_ice_url: `${BuildInternalUrl()}/prosody/ice`,
      talky_core_telemetry_url: `${BuildInternalUrl()}/prosody/telemetry`,
      talky_core_instance_check_url: `${BuildInternalUrl()}/instance-check`,

      hosts: {
        [Domains.api]: {},
        [Domains.signaling]: {},

        [Domains.guests]: {
          modules_enabled: [
            'talky_core_ice'
          ],
          authentication: 'talky_core',
          talky_core_auth_allow_anonymous: true,
          talky_core_auth_url: `${BuildInternalUrl()}/prosody/auth/guest`
        },

        [Domains.users]: {
          authentication: 'talky_core',
          talky_core_auth_url: `${BuildInternalUrl()}/prosody/auth/user`
        },

        [Domains.bots]: {
          authentication: 'talky_core',
          talky_core_auth_url: `${BuildInternalUrl()}/prosody/auth/bot`
        }
      },

      components: {
        [Domains.rooms]: {
          modules_enabled: [
            'muc_config_restrict',
            'talky_core_muc_room_id',
            'talky_core_muc_config',
            'talky_core_muc_affiliations',
            'talky_core_muc_info',
            'talky_core_version'
          ],
          talky_core_version: Config.talky.apiVersion,
          talky_core_muc_affiliation_url: `${BuildInternalUrl()}/prosody/rooms/affiliation`,
          talky_core_muc_user_info_url: `${BuildInternalUrl()}/prosody/rooms/user-info`,
          muc_config_restricted: [
            'muc#roomconfig_moderatedroom',
            'muc#roomconfig_whois',
            'muc#roomconfig_persistentroom',
            'muc#roomconfig_historylength',
            'muc#roomconfig_publicroom',
            'muc#roomconfig_membersonly',
            'muc#roomconfig_changesubject',
            'muc#roomconfig_roomdesc',
            'muc#roomconfig_affiliationnotify',
            'muc#roomconfig_roomname'
          ]
        }
      }
    };

    return prosodyConfig;
  },
  auth: 'internal-api'
};
