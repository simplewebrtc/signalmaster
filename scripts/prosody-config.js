const Config = require('getconfig');

const inflateDomains = require('../lib/domains');
const buildUrl = require('../lib/buildUrl');
const Domains = inflateDomains(Config.talky.domains);


console.log(`
admins = {}
plugin_paths = { "${__dirname + '/../prosody_modules'}" }

daemonize = false
use_libevent = true

modules_enabled = {
    "saslauth"; "roster";
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
    "http_altconnect";
    "posix";
    "bosh";
    "websocket";
}

allow_registration = false

c2s_require_encryption = true
s2s_secure_auth = true

cross_domain_bosh = true
cross_domain_websocket = true

consider_bosh_secure = true
consider_websocket_secure = true

network_default_read_size = 66560

log = {
    debug = "*console";
    verbose = "*console";
}

talky_core_api_key = "${Config.auth.secret}"
`);

if (Config.isDev) {
    console.log(`
modules_disabled = {
    "tls";
}
`)
}


console.log(`
VirtualHost "${Domains.api}"
`);

console.log(`
VirtualHost "${Domains.guests}"
    authentication = "talky_core";
    talky_core_auth_url = "${buildUrl('http', Domains.api)}/prosody/auth/guest";
`);

console.log(`
VirtualHost "${Domains.users}"
    authentication = "talky_core";
    talky_core_auth_url = "${buildUrl('http', Domains.api)}/prosody/auth/user";
`);

console.log(`
VirtualHost "${Domains.bots}"
    authentication = "talky_core";
    talky_core_auth_url = "${buildUrl('http', Domains.api)}/prosody/auth/bot";
`);

console.log(`
Component "${Domains.rooms}" "muc"
    modules_enabled = {
        "muc_allhidden";
        "muc_config_restrict";
        "talky_core_muc_affiliations";
    };

    talky_core_muc_affiliation_url = "${buildUrl('http', Domains.api)}/prosody/rooms/affiliation";

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

