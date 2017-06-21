-- Globals required by socket.http
if rawget(_G, "PROXY") == nil then
    rawset(_G, "PROXY", false)
end
if rawget(_G, "base_parsed") == nil then
    rawset(_G, "base_parsed", false)
end

local http = require "socket.http";
local https = require "ssl.https";
local json_encode = require "util.json".encode;
local jid_split = require "util.jid".split;
local hmac_sha1 = require "util.hashes".hmac_sha1;
local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local ltn12 = require("ltn12")
local os_time = os.time;

local api_key = module:get_option_string("talky_core_api_key", "");
local telemetry_url = module:get_option_string("talky_core_telemetry_url", "");


local request;
if string.sub(telemetry_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function post_event(eventType, data)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Posting %s telemetry with URL %s", eventType, telemetry_url);
    local body = json_encode({
        eventType = eventType;
        data = data;
    });

    request({
        url = telemetry_url,
        method = "POST",
        headers = {
            Authorization = "Basic "..base64(userpart..":"..secret);
            ["Content-Type"] = "application/json";
            ["Content-Length"] = string.len(body);
        };
        source = ltn12.source.string(body);
    });
end


module:hook("resource-bind", function (event)
    post_event("user_online", {
        sessionId = event.session.resource;
        userId = event.session.username.."@"..event.session.host;
    });
end);


module:hook("resource-unbind", function (event)
    post_event("user_offline", {
        sessionId = event.session.resource;
        userId = event.session.username.."@"..event.session.host;
    });
end);


module:hook("muc-occupant-joined", function (event)
    post_event("occupant_joined", {});
end);


module:hook("muc-occupant-left", function (event)
    post_event("occupant_left", {});
end);


module:hook("muc-room-created", function (event)
    post_event("room_created", {});
end);


module:hook("muc-room-destroyed", function (event)
    post_event("room_destroyed", {});
end);


module:log("info", "Loaded mod_talky_core_metrics for %s", module.host or "*");

