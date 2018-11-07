local async = require "util.async";
local http = require "net.http";
local json_encode = require "util.json".encode;
local jid_split = require "util.jid".split;
local jid_bare = require "util.jid".bare;
local hmac_sha1 = require "util.hashes".hmac_sha1;
local base64 = require "util.encodings".base64.encode;
local serialize = require "util.serialization".serialize;
local os_time = os.time;

local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;

local api_key = module:get_option_string("talky_core_api_key", "");
local muc_affiliation_url = module:get_option_string("talky_core_muc_affiliation_url",  "");

local affiliation_cache = {};

local function fetch_affiliation(room, jid)
    module:log("debug", "Testing room affiliation for user %s in room %s with URL %s", jid, room.jid, muc_affiliation_url);

    local cached = affiliation_cache[jid];
    if cached then
        module:log("debug", "Using cached affiliation: "..cached);
        return cached;
    end

    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    local body = json_encode({
        user_id = jid;
        room_id = room.jid;
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
    http.request(muc_affiliation_url, ex, cb);
    wait();

    if type(code) == "number" and code >= 200 and code <= 299 then
        module:log("debug", "HTTP API returned affiliation: "..content);
        affiliation_cache[jid] = content;
        return content;
    else
        module:log("warn", "HTTP API returned status code: "..code);
    end

    return nil, "Affiliation lookup failed: "..content;
end

local function apply_api_affiliation(room, stanza)
    local jid = jid_bare(stanza.attr.from);
    local affiliation, err = fetch_affiliation(room, jid);
    if err then
        affiliation = "outcast";
    end

    room:set_affiliation(true, jid, affiliation);
end

module:hook("muc-room-pre-create", function (event)
    apply_api_affiliation(event.room, event.stanza);
end, -100);

-- ////////////////////////////////////////////////////////////////////
-- This hook needs to run _after_ the password check handler in the
-- built-in Prosody muc/password.lib.lua. That hook has its priority
-- set to -20.
--
-- Otherwise, we will have set the user affiliation before password
-- checks have completed, possibly granting the user an owner
-- affiliation that would allow changing the password.
-- ////////////////////////////////////////////////////////////////////
module:hook("muc-occupant-pre-join", function (event)
    apply_api_affiliation(event.room, event.stanza);
end, -100);

module:hook("muc-occupant-left", function (event)
    local jid = event.occupant.bare_jid;
    affiliation_cache[jid] = nil;
end);

module:log("info", "Loaded mod_talky_core_muc_affiliations for %s", module.host);
