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
local serialize = require "util.serialization".serialize;
local ltn12 = require("ltn12")

local instance_check_url = module:get_option_string("talky_core_instance_check_url", "");


local request;
if string.sub(instance_check_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function fetch_identifier()
    module:log("debug", "Fetching service instance identifier with URL %s",  instance_check_url);

    local response = {};
    local _, code = request({
        url = instance_check_url;
        method = "GET",
        sink = ltn12.sink.table(response);
    });

    local data = table.concat(response);

    local code = 200;
    if type(code) == "number" and code >= 200 and code <= 299 then
        module:log("debug", "HTTP API returned identifer: "..data);
        return data;
    else
        module:log("debug", "HTTP API returned status code: "..code);
    end

    return nil, "Instance identifier lookup failed: "..data;
end


module:provides("http", {
    default_path = "/";
    route = {
        ["GET /instance-check"] = function (event)
            local response = event.response;
            response.headers.content_type = "application/json";
            response.headers.access_control_allow_origin = "*";

            local identifier, err = fetch_identifier();
            if err then
                response.statusCode = 404;
            else
                return identifier;
            end
        end
    }
});

module:log("info", "Loaded mod_talky_core_instance_check for %s", module.host);
