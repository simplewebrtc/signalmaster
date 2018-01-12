module:set_global();

local time = require "socket".gettime;
local base64_decode = require "util.encodings".base64.decode;

local max_seconds = module:get_option_number("log_slow_events_threshold", 0.5);

local measure_slow_event = module:measure("slow_events", "rate");

function event_wrapper(handlers, event_name, event_data)
	local start = time();
	local ret = handlers(event_name, event_data);
	local duration = time()-start;
	if duration > max_seconds then
		local data = {};
		if event_data then
			local function log_data(name, value)
				if value then
					table.insert(data, ("%s=%q"):format(name, value));
					return true;
				end
			end
			local sess = event_data.origin or event_data.session;
			if sess then
				log_data("ip", sess.ip);
				if not log_data("full_jid", sess.full_jid) then
					log_data("username", sess.username);
				end
				log_data("type", sess.type);
				log_data("host", sess.host);
			end
			local stanza = event_data.stanza;
			if stanza then
				log_data("stanza", tostring(stanza));
			else
				local request = event_data.request;
				if request then
					log_data("http_method", request.method);
					log_data("http_path", request.path);
					local auth = request.headers.authorization;
					if auth then
						local creds = auth:match("^Basic +(.+)$");
						if creds then
							local user = string.match(base64_decode(creds) or "", "^([^:]+):");
							log_data("http_user", user);
						end
					end
				end
			end
		end
		measure_slow_event();
		module:log("warn", "Slow event '%s' took %0.2fs: %s", event_name, duration, next(data) and table.concat(data, ", ") or "no recognised data");
	end
	return ret;
end

local http_events = require "net.http.server"._events;
module:wrap_object_event(http_events, false, event_wrapper);

module:wrap_event(false, event_wrapper);
function module.add_host(module)
	module:wrap_event(false, event_wrapper);
end
