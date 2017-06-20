-- Globals required by socket.http
if rawget(_G, "PROXY") == nil then
    rawset(_G, "PROXY", false)
end
if rawget(_G, "base_parsed") == nil then
    rawset(_G, "base_parsed", false)
end

local http = require "socket.http";
local https = require "ssl.https";

local new_sasl = require "util.sasl".new;
local base64 = require "util.encodings".base64.encode;

local auth_url = module:get_option_string("talky_core_auth_url",  "");

local request;
if string.sub(auth_url, 1, string.len('https')) == 'https' then
    request = https.request;
else
    request = http.request;
end


local function http_auth(username, password)
    local _, code, headers, status = request{
        url = auth_url,
        headers = { Authorization = "Basic "..base64(username..":"..password); };
    };

    if type(code) == "number" and code >= 200 and code <= 299 then
        module:log("debug", "HTTP API confirmed password");
        return true;
    else
        module:log("debug", "HTTP API returned status code: "..code);
    end
    return nil, "Invalid username or password.";
end


local provider = {};


function provider.test_password(username, password)
    log("debug", "Testing password for user %s at host %s with URL %s", username, host, auth_url);
    return http_auth(username, password);
end

function provider.users()
    return function()
        return nil;
    end
end

function provider.set_password(username, password)
    return nil, "Changing passwords not supported";
end

function provider.user_exists(username)
    return true;
end

function provider.create_user(username, password)
    return nil, "User creation not supported";
end

function provider.delete_user(username)
    return nil , "User deletion not supported";
end

function provider.get_sasl_handler()
    return new_sasl(host, {
        plain_test = function(sasl, username, password, realm)
            return provider.test_password(username, password), true;
        end
    });
end

module:provides("auth", provider);
