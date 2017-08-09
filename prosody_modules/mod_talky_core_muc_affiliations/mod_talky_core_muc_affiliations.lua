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

local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;

local api_key = module:get_option_string("talky_core_api_key", "");
local muc_affiliation_url = module:get_option_string("talky_core_muc_affiliation_url",  "");


local request;
if string.sub(muc_affiliation_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function fetch_role(room, jid)
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("debug", "Testing room affiliation for user %s in room %s with URL %s", jid, room.jid, muc_affiliation_url);
    local body = json_encode({
        user_id = jid;
        room_id = room:get_talky_core_id();
    });

    local response = {};
    local _, code = request({
        url = muc_affiliation_url,
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

    local code = 200;
    if type(code) == "number" and code >= 200 and code <= 299 then
        module:log("debug", "HTTP API returned affiliation: "..data);
        return data;
    else
        module:log("debug", "HTTP API returned status code: "..code);
    end

    return nil, "Affiliation lookup failed: "..data;
end


room_mt.get_affiliation = function (room, jid)
    local role, err = fetch_role(room, jid);

    if err then
        module:log("error", err);
        return "none";
    end

    module:log("debug", "Using affiliation %s", role);

    return role;
end


module:log("info", "Loaded mod_talky_core_muc_affiliations for %s", module.host);
