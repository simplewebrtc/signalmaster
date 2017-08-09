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
local jid_resource = require "util.jid".resource;
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
        session_id = event.session.resource;
        user_id = event.session.username.."@"..event.session.host;
    });
end);


module:hook("resource-unbind", function (event)
    post_event("user_offline", {
        session_id = event.session.resource;
        user_id = event.session.username.."@"..event.session.host;
    });
end);


module:hook("muc-occupant-session-new", function (event)
    local user, domain, session_id = jid_split(event.jid);
    post_event("occupant_joined", {
        room_id = event.room:get_talky_core_id();
        user_id = user.."@"..domain;
        session_id = session_id;
        in_room_session_id = jid_resource(event.nick);
    });
end);


module:hook("muc-occupant-left", function (event)
    if event.stanza then
        post_event("occupant_left", {
            room_id = event.room:get_talky_core_id();
            user_id = event.occupant.bare_jid;
            session_id = jid_resource(event.stanza.attr.from);
            in_room_session_id = jid_resource(event.nick);
        });
    else
        for real_jid in event.occupant:each_session() do
            post_event("occupant_left", {
                room_id = event.room:get_talky_core_id();
                user_id = event.occupant.bare_jid;
                session_id = jid_resource(real_jid);
                in_room_session_id = jid_resource(event.nick);
            });
        end
    end
end);


module:hook("muc-room-pre-create", function (event)
    local roomName = jid_split(event.room.jid);
    post_event("room_created", {
        room_id = event.room:get_talky_core_id();
        name = roomName;
        jid = event.room.jid;
    });
end);


module:hook("muc-room-destroyed", function (event)
    local roomName = jid_split(event.room.jid);
    post_event("room_destroyed", {
        room_id = event.room:get_talky_core_id();
        name = roomName;
        jid = event.room.jid;
    });
end);


module:log("info", "Loaded mod_talky_core_metrics for %s", module.host or "*");

