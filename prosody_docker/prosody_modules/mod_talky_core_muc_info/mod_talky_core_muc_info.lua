local async = require "util.async";
local http = require "net.http";
local json_encode = require "util.json".encode;
local json_decode = require "util.json".decode;
local jid_split = require "util.jid".split;
local jid_resource = require "util.jid".resource;
local hmac_sha1 = require "util.hashes".hmac_sha1;
local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local os_time = os.time;

local xmlns_talky = "https://talky.io/ns/core";

local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;

local api_key = module:get_option_string("talky_core_api_key", "");
local user_info_url = module:get_option_string("talky_core_muc_user_info_url",  "");

local function get_talky_core_info(room, occupant_nick)
    if not room._data.talky_core_info then
        return {};
    end
    return room._data.talky_core_info[occupant_nick] or {};
end

local function set_talky_core_info(room, occupant_nick, info)
    if not info then
        return false;
    end 

    if not room._data.talky_core_info then
        room._data.talky_core_info = {};
    end

    room._data.talky_core_info[occupant_nick] = info;

    return true;
end

room_mt.get_talky_core_info = get_talky_core_info;
room_mt.set_talky_core_info = set_talky_core_info;


local function fetch_info(room, user_id, session_id)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Fetching info for user %s in room %s with URL %s", user_id, room.jid, user_info_url);
    local body = json_encode({
        user_id = user_id;
        session_id = session_id;
        room_id = room:get_talky_core_id();
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
    http.request(user_info_url, ex, cb);
    wait();

    module:log("debug", "Received user data %s", content);

    if code <= 200 or code >= 300 then
        module:log("warn", "HTTP API returned status code %d", code);
    end

    return json_decode(content);
end


local function stamp_info(event)
    local room, origin, stanza = event.room, event.origin, event.stanza;

    if stanza.attr.type == "unavailable" then
        return;
    end

    occupant = room:get_occupant_by_real_jid(stanza.attr.from) or event.occupant;
    if not occupant then
        return;
    end
    local user_info = room:get_talky_core_info(occupant.nick);

    stanza:maptags(function (tag)
        if not ((tag.name == "user") and tag.attr.xmlns == xmlns_talky) then
            return tag;
        end
    end);
    local tag = stanza:tag("user", {
        xmlns = xmlns_talky;
        type = user_info.userType or "guest";
        sid = user_info.id;
        rid = room:get_talky_core_id();
    });
    if user_info.customerData then
        tag:text(json_encode(user_info.customerData));
    end
    event.stanza = tag:up();
end


module:hook("muc-occupant-pre-join", function (event)
    local data = fetch_info(event.room, event.occupant.bare_jid, jid_resource(event.stanza.attr.from));
    event.occupant.nick = event.room.jid.."/"..data.id; -- lock down MUC nicks

    event.room:set_talky_core_info(event.occupant.nick, data);
    stamp_info(event);
end);

module:hook("muc-occupant-pre-change", function (event)
    if event.occupant and event.dest_occupant then
        event.dest_occupant.nick = event.occupant.nick; -- lock down MUC nicks
    end

    stamp_info(event);
end);


module:log("info", "Loaded mod_talky_core_muc_user_info for %s", module.host);
