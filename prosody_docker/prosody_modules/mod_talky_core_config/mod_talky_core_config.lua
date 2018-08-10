module:set_global();

local http = require "net.http";
local timer = require "util.timer";
local json_encode = require "util.json".encode;
local json_decode = require "util.json".decode;
local hmac_sha1 = require "util.hashes".hmac_sha1; local base64 = require "util.encodings".base64.encode;
local os_time = os.time;
local serialize = require "util.serialization".serialize;

local hostmanager = require "core.hostmanager";
local configmanager = require "core.configmanager";

local api_key = module:get_option_string("talky_core_api_key", "");
local config_url = module:get_option_string("talky_core_config_url",  "");
local server_name = module:get_option_string("talky_core_server_name", "default");


local function apply_config(config)
    configmanager.set("*", "talky_core_telemetry_url", config.talky_core_telemetry_url);

    configmanager.set("*", "allow_registration", false);
    configmanager.set("*", "consider_websocket_secure", true);
    configmanager.set("*", "cross_domain_websocket", true);
    configmanager.set("*", "network_default_read_size", config.network_default_read_size or 66560);

    configmanager.set("*", "modules_disabled", { "tls" });

    configmanager.set("*", "http_paths", {
        websocket = "/ws-bind";
    });

    configmanager.set("*", "log", {
        ["debug"] = "*console";
    });

    local enabled = configmanager.get("*", "modules_enabled");
    for i, mod in ipairs(config.modules_enabled) do
        table.insert(enabled, mod);
    end
    configmanager.set("*", "modules_enabled", enabled);

    if config.hosts then
        for host, host_config in pairs(config.hosts) do
            host_config.enabled = true;
            host_config.modules_enabled = host_config.modules_enabled or {};
            if host_config.authentication then
                table.insert(host_config.modules_enabled, "auth_" .. host_config.authentication);
            end
            for field, value in pairs(host_config) do
                configmanager.set(host, field, value);
            end
            hostmanager.activate(host, host_config);
        end
    end

    if config.components then
        for component, component_config in pairs(config.components) do
            component_config.enabled = true;
            component_config.component_module = "muc";
            component_config.modules_enabled = component_config.modules_enabled or {};
            for field, value in pairs(component_config) do
                configmanager.set(component, field, value);
            end
            hostmanager.activate(component, component_config);
        end
    end
end


local function fetch_config()
    local userpart = tostring(os_time());
    local secret = base64(hmac_sha1(api_key, userpart, false))

    module:log("info", "Fetching Prosody config with URL %s", config_url);

    local body = json_encode({
        server = server_name;
    });
    local ex = {
        method = "POST";
        headers = {
            Authorization = "Basic "..base64(userpart..":"..secret);
            ["Content-Type"] = "application/json";
            ["Content-Length"] = string.len(body);
        };
        body = body;
    };
 
    http.request(config_url, ex, function (content, code)
        if code ~= 200 then
            module:log("warn", "Did not receive Prosody config (code %s). Trying again.", code or "no-code");
            timer.add_task(1, fetch_config);
            return;
        end

        module:log("info", "Received Prosody config: %s %s", code, content);
        apply_config(json_decode(content));
    end);
end


module:hook_global("server-started", function(event)
    fetch_config();
end);


function module.add_host(module)
    module:depends("http");
    module:provides("http", {
        default_path = "/";
        route = {
            ["GET /"] = function (event)
                event.response.statusCode = 200;
                return "ok";
            end;
    
            ["HEAD /"] = function (event)
                event.response.statusCode = 200;
                return "";
            end;
        };
    });
end


module:log("info", "Loaded mod_talky_core_config");
