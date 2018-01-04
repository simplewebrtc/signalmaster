local async = require "util.async";
local http = require "net.http";
local st = require "util.stanza";
local json_encode = require "util.json".encode;
local json_decode = require "util.json".decode;
local jid_split = require "util.jid".split;
local jid_resource = require "util.jid".resource;
local hmac_sha1 = require "util.hashes".hmac_sha1; local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local os_time = os.time;

local api_key = module:get_option_string("talky_core_api_key", "");
local ice_url = module:get_option_string("talky_core_ice_url",  "");


local function fetch_ice(user_id, session_id)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Fetching ICE servers with URL %s", ice_url);

    local body = json_encode({
        user_id = user_id;
        session_id = session_id;
    });
    local wait, done = async.waiter();
    local content, code, request, response;
    local ex = {
        method = "POST";
        headers = {
            Authorization = "Basic "..base64(userpart..":"..secret);
            ["Content-Type"] = "application/json";
            ["Content-Length"] = string.len(body);
        };
        body = body;
    };
    local function cb(content_, code_, request_, response_)
        content, code, request, response = content_, code_, request_, response_;
        done();
    end
    http.request(ice_url, ex, cb);
    wait();

    module:log("debug", "Received ICE data %s", content);

    return json_decode(content);
end


module:hook("iq-get/host/urn:xmpp:extdisco:1:services", function(event)
    local origin, stanza = event.origin, event.stanza;
    local user, domain, resource = jid_split(stanza.attr.from);
    local ice, err = fetch_ice(user..'@'..domain, resource);

    if err then
        module:log("error", err);
        origin.send(st.error_reply(stanza, "wait", "internal-server-error"));
        return true;
    end

    local reply = st.reply(stanza):tag("services", { xmlns = "urn:xmpp:extdisco:1" })

    for idx, item in pairs(ice) do
        reply:tag("service", item):up();
    end

    origin.send(reply);
    return true;
end);


module:log("info", "Loaded mod_talky_core_ice for %s", module.host);
