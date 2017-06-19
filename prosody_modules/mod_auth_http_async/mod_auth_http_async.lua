-- Prosody IM
-- Copyright (C) 2008-2013 Matthew Wild
-- Copyright (C) 2008-2013 Waqas Hussain
-- Copyright (C) 2014 Kim Alvefur
--
-- This project is MIT/X11 licensed. Please see the
-- COPYING file in the source package for more information.
--

local new_sasl = require "util.sasl".new;
local base64 = require "util.encodings".base64.encode;
local have_async, async = pcall(require, "util.async");

local log = module._log;
local host = module.host;

local api_base = module:get_option_string("http_auth_url",  ""):gsub("$host", host);
if api_base == "" then error("http_auth_url required") end

local provider = {};

-- globals required by socket.http
if rawget(_G, "PROXY") == nil then
	rawset(_G, "PROXY", false)
end
if rawget(_G, "base_parsed") == nil then
	rawset(_G, "base_parsed", false)
end

local function async_http_auth(url, username, password)
	local http = require "net.http";
	local wait, done = async.waiter();
	local content, code, request, response;
	local ex = {
		headers = { Authorization = "Basic "..base64(username..":"..password); };
	}
	local function cb(content_, code_, request_, response_)
		content, code, request, response = content_, code_, request_, response_;
		done();
	end
	http.request(url, ex, cb);
	wait();
	if code >= 200 and code <= 299 then
		module:log("debug", "HTTP auth provider confirmed valid password");
		return true;
	else
		module:log("debug", "HTTP auth provider returned status code %d", code);
	end
	return nil, "Auth failed. Invalid username or password.";
end

local function sync_http_auth(url)
	local http = require "socket.http";
	local https = require "ssl.https";
	local request;
	if string.sub(url, 1, string.len('https')) == 'https' then
		request = https.request;
	else
		request = http.request;
	end
	local _, code, headers, status = request{
		url = url,
		headers = { ACCEPT = "application/json, text/plain, */*"; }
	};
	if type(code) == "number" and code >= 200 and code <= 299 then
		module:log("debug", "HTTP auth provider confirmed valid password");
		return true;
	else
		module:log("debug", "HTTP auth provider returned status code: "..code);
	end
	return nil, "Auth failed. Invalid username or password.";
end

function provider.test_password(username, password)
	local url = api_base:gsub("$user", username):gsub("$password", password);
	log("debug", "Testing password for user %s at host %s with URL %s", username, host, url);
	if (have_async) then
		return async_http_auth(url, username, password);
	else
		return sync_http_auth(url);
	end
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
