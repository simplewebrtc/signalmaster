local async = require "util.async";
local http = require "net.http";

local new_sasl = require "util.sasl".new;
local base64 = require "util.encodings".base64.encode;

local auth_url = module:get_option_string("talky_core_auth_url",  "");


local function http_auth(username, password)
    local wait, done = async.waiter();
    local content, code, request, response;
    local ex = {
        headers = { Authorization = "Basic "..base64(username..":"..password); };
    }
    local function cb(content_, code_, request_, response_)
        content, code, request, response = content_, code_, request_, response_;
        done();
    end
    http.request(auth_url, ex, cb);
    wait();
    if code >= 200 and code <= 299 then
        module:log("debug", "HTTP auth provider confirmed valid password");
        return true;
    else
        module:log("warn", "HTTP auth provider returned status code %d", code);
    end
    return nil, "Auth failed. Invalid username or password.";
end


local provider = {};


function provider.test_password(username, password)
    log("debug", "Testing password for user %s at host %s with URL %s", username, module.host, auth_url);
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
    local profile = {
        plain_test = function(sasl, username, password, realm)
            return provider.test_password(username, password), true;
        end;
    };

    return new_sasl(module.host, profile);
end

module:provides("auth", provider);


module:log("info", "Loaded mod_auth_talky_core for %s", module.host);
