-- Globals required by socket.http
if rawget(_G, "PROXY") == nil then
    rawset(_G, "PROXY", false)
end
if rawget(_G, "base_parsed") == nil then
    rawset(_G, "base_parsed", false)
end

local http = require "socket.http";
local https = require "ssl.https";
local st = require "util.stanza";
local json_encode = require "util.json".encode;
local json_decode = require "util.json".decode;
local jid_split = require "util.jid".split;
local jid_resource = require "util.jid".resource;
local hmac_sha1 = require "util.hashes".hmac_sha1; local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local ltn12 = require("ltn12")
local os_time = os.time;

local api_key = module:get_option_string("talky_core_api_key", "");
local ice_url = module:get_option_string("talky_core_ice_url",  "");


local request;
if string.sub(ice_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function fetch_ice(user_id, session_id)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Fetching ICE servers with URL %s", ice_url);

    local body = json_encode({
        user_id = user_id;
        session_id = session_id;
    });

    local response = {};
    local _, code = request({
        url = ice_url,
        method = "POST",
        headers = {
            Authorization = "Basic "..base64(userpart..":"..secret);
            ["Content-Type"] = "application/json";
            ["Content-Length"] = string.len(body);
        };
        sink = ltn12.sink.table(response);
        source = ltn12.source.string(body);
    });

    local data = table.concat(response);

    module:log("debug", "Received ICE data %s", data);

    return json_decode(data);
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
