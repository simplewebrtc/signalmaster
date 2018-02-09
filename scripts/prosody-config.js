'use strict';

const Config = require('getconfig');
const BuildInternalUrl = require('../lib/build_internal_url');


console.log(`
plugin_paths = {
    ${Config.getconfig.env !== 'production' ? `"${__dirname}/../prosody_docker/prosody_modules";` : ''}
    "/etc/prosody_modules";
    "/usr/lib/prosody-modules";
}

daemonize = false
use_libevent = true

log = {
    debug = "*console";
}

modules_enabled = {
    "posix";
    "talky_core_config";
}

talky_core_api_key = "${Config.auth.secret}"
talky_core_config_url = "${BuildInternalUrl()}/prosody/config";

VirtualHost "_placeholder_";
`);

