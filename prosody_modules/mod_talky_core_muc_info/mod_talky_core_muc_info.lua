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
local json_decode = require "util.json".decode;
local jid_split = require "util.jid".split;
local jid_resource = require "util.jid".resource;
local hmac_sha1 = require "util.hashes".hmac_sha1;
local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local ltn12 = require("ltn12")
local os_time = os.time;

local xmlns_talky = "https://talky.io/ns/core";

local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;

local api_key = module:get_option_string("talky_core_api_key", "");
local user_info_url = module:get_option_string("talky_core_muc_user_info_url",  "");


local request;
if string.sub(user_info_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function fetch_info(room, userId, sessionId)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Fetching info for user %s in room %s with URL %s", userId, room.jid, user_info_url);
    local body = json_encode({
        userId = userId;
        sessionId = sessionId;
        roomId = room:get_talky_core_id();
    });

    local response = {};
    local _, code = request({
        url = user_info_url,
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

    module:log("debug", data);

    return json_decode(data);
end



module:hook("muc-occupant-pre-join", function (event)
    local data = fetch_info(event.room, event.occupant.bare_jid, jid_resource(event.stanza.attr.from));

    event.occupant.talky_core_info = data;
end, 5);


local function stamp_info(event)
    local room, origin, occupant, stanza = event.room, event.origin, event.occupant, event.stanza

    if stanza.attr.type == "unavailable" then
        return;
    end

    if not occupant then
        return;
    end

    local userInfo = occupant.talky_core_info or {};
    
    stanza:maptags(function (tag)
        if not ((tag.name == "user") and tag.attr.xmlns == xmlns_talky) then
            return tag;
        end
    end);

    local tag = stanza:tag("user", {
        xmlns = xmlns_talky;
        type = userInfo.userType or "guest";
        sid = userInfo.sessionId;
        rid = room:get_talky_core_id();
    });
    
    if userInfo.customerData then
        tag:text(json_encode(userInfo.customerData));
    end
end

module:hook("muc-occupant-pre-change", stamp_info, 2);
module:hook("muc-occupant-pre-join", stamp_info, 2);



module:log("info", "Loaded mod_talky_core_muc_user_info for %s", module.host);
