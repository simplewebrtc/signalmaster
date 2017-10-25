
admins = {}
plugin_paths = {
    "/usr/local/src/gar/andyet/talky-core-api/scripts/../prosody_docker/prosody_modules";
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

c2s_require_encryption = false 
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

talky_core_api_key = "internal-use-jwt-password-makethisoneprettysecureok"
talky_core_telemetry_url = "http://localhost:8001/prosody/telemetry"
talky_core_instance_check_url = "http://localhost:8001/instance-check";


modules_disabled = {
    "tls";
}


VirtualHost "localhost"


VirtualHost "guests.localhost"
    authentication = "talky_core";
    talky_core_auth_allow_anonymous = true;
    talky_core_auth_url = "http://localhost:8001/prosody/auth/guest";


VirtualHost "users.localhost"
    authentication = "talky_core";
    talky_core_auth_url = "http://localhost:8001/prosody/auth/user";


VirtualHost "bots.localhost"
    authentication = "talky_core";
    talky_core_auth_url = "http://localhost:8001/prosody/auth/bot";


Component "rooms.localhost" "muc"
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
    talky_core_muc_affiliation_url = "http://localhost:8001/prosody/rooms/affiliation";
    talky_core_muc_user_info_url = "http://localhost:8001/prosody/rooms/user-info";


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

