'use strict';

const Joi = require('joi');

const Domains = require('../../lib/domains');
const InternalUrl = require('../../lib/internal_url');

const ResetDB = require('../../lib/reset_db');

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
        'talky_core_metrics'
      ],

      log_level: 'info',

      talky_core_telemetry_url: `${InternalUrl}/prosody/telemetry`,

      hosts: {
        [Domains.api]: {},
        [Domains.signaling]: {},

        [Domains.guests]: {
          authentication: 'talky_core',
          talky_core_auth_url: `${InternalUrl}/prosody/auth/guest`
        },

        [Domains.users]: {
          authentication: 'talky_core',
          talky_core_auth_url: `${InternalUrl}/prosody/auth/user`
        }
      },

      components: {
        [Domains.rooms]: {
          modules_enabled: [
            'muc_config_restrict',
            'talky_core_metrics',
            'talky_core_muc_room_id',
            'talky_core_muc_affiliations',
            'talky_core_muc_info'
          ],
          talky_core_muc_affiliation_url: `${InternalUrl}/prosody/rooms/affiliation`,
          talky_core_muc_user_info_url: `${InternalUrl}/prosody/rooms/user-info`,
          muc_room_default_public: false,
          muc_room_default_persistent: false,
          muc_room_allow_public: false,
          muc_room_allow_persistent: false,
          muc_room_locking: false,
          muc_tombstones: false,
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

    await ResetDB({ db: this.db, redis: this.redis, shard: request.payload.server });

    return prosodyConfig;
  },
  auth: 'internal-api',
  validate: {
    payload: {
      server: Joi.string()
    }
  }
};
