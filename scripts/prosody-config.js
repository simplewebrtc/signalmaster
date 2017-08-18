'use strict';

const Config = require('getconfig');

const InflateDomains = require('../lib/domains');
const BuildUrl = require('../lib/build_url');
const Domains = InflateDomains(Config.talky.domains);

console.log(`
admins = {}
plugin_paths = {
    ${Config.getconfig.env !== 'production' ? `"${__dirname}/../prosody_docker/prosody_modules";` : ''}
    "/etc/prosody_modules";
    "/usr/lib/prosody-modules";
}

daemonize = false
use_libevent = true

modules_enabled = {
    "saslauth";
    "roster";
    "tls";
    "dialback";
    "disco";
    "private";
    "vcard";
    "version";
    "uptime";
    "time";
    "ping";
    "pep";
    "admin_adhoc";
    "admin_telnet";
    "posix";
    "bosh";
    "websocket";
    "talky_core_metrics";
    "talky_core_instance_check";
}

allow_registration = false

c2s_require_encryption = ${Config.isDevTLS} 
s2s_secure_auth = true

cross_domain_bosh = true
cross_domain_websocket = true

consider_bosh_secure = true
consider_websocket_secure = true

http_paths = { 
    bosh = "/http-bind";
    websocket = "/ws-bind";
}

network_default_read_size = 66560

log = {
    debug = "*console";
    verbose = "*console";
}

talky_core_api_key = "${Config.auth.secret}"
talky_core_telemetry_url = "${BuildUrl('http', Domains.api)}/prosody/telemetry"
talky_core_instance_check_url = "${BuildUrl('http', Domains.api)}/instance-check";
`);

if (Config.getconfig.env !== 'production') {
  console.log(`
modules_disabled = {
    "tls";
}
`);
}
else {
  // set default ssl certs
  console.log(`
ssl = {
    key = "${Config.TLS.keyFile}";
    certificate = "${Config.TLS.pemFile}";
}
    `);
}


console.log(`
VirtualHost "${Domains.api}"
`);

if (Domains.signaling !== Domains.api) {
  console.log(`
VirtualHost "${Domains.signaling}"
`);
}

console.log(`
VirtualHost "${Domains.guests}"
    authentication = "talky_core";
    talky_core_auth_allow_anonymous = true;
    talky_core_auth_url = "${BuildUrl('http', Domains.api)}/prosody/auth/guest";
`);

console.log(`
VirtualHost "${Domains.users}"
    authentication = "talky_core";
    talky_core_auth_url = "${BuildUrl('http', Domains.api)}/prosody/auth/user";
`);

console.log(`
VirtualHost "${Domains.bots}"
    authentication = "talky_core";
    talky_core_auth_url = "${BuildUrl('http', Domains.api)}/prosody/auth/bot";
`);

console.log(`
Component "${Domains.rooms}" "muc"
    modules_enabled = {
        "muc_config_restrict";
        "talky_core_muc_room_id";
        "talky_core_muc_config";
        "talky_core_muc_affiliations";
        "talky_core_muc_info";
        "talky_core_version";
        "talky_core_metrics";
    };

    talky_core_version = "2.0.0";
    talky_core_muc_affiliation_url = "${BuildUrl('http', Domains.api)}/prosody/rooms/affiliation";
    talky_core_muc_user_info_url = "${BuildUrl('http', Domains.api)}/prosody/rooms/user-info";


    muc_config_restricted = {
        "muc#roomconfig_moderatedroom";
        "muc#roomconfig_whois";
        "muc#roomconfig_persistentroom";
        "muc#roomconfig_historylength";
        "muc#roomconfig_publicroom";
        "muc#roomconfig_membersonly";
        "muc#roomconfig_changesubject";
        "muc#roomconfig_roomdesc";
        "muc#roomconfig_affiliationnotify";
        "muc#roomconfig_roomname";
    };
`);
