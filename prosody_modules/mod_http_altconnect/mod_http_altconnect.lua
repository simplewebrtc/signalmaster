-- mod_http_altconnect
-- XEP-0156: Discovering Alternative XMPP Connection Methods

module:depends"http";

local json = require"util.json";
local st = require"util.stanza";
local array = require"util.array";

local host_modules = hosts[module.host].modules;

local function get_supported()
	local uris = array();
	if host_modules["bosh"] then
		uris:push({ rel = "urn:xmpp:alt-connections:xbosh", href = module:http_url("bosh", "/http-bind") });
	end
	if host_modules["websocket"] then
		uris:push({ rel = "urn:xmpp:alt-connections:websocket", href = module:http_url("websocket", "xmpp-websocket"):gsub("^http", "ws") });
	end
	return uris;
end


local function GET_xml(event)
	local request, response = event.request, event.response;
	local xrd = st.stanza("XRD", { xmlns='http://docs.oasis-open.org/ns/xri/xrd-1.0' });
	local uris = get_supported();
	for i, method in ipairs(uris) do
		xrd:tag("Link", method):up();
	end
	response.headers.content_type = "application/xrd+xml"
	response.headers.access_control_allow_origin = "*";
	return '<?xml version="1.0" encoding="UTF-8"?>' .. tostring(xrd);
end

local function GET_json(event)
	local request, response = event.request, event.response;
	local jrd = { links = get_supported() };
	response.headers.content_type = "application/json"
	response.headers.access_control_allow_origin = "*";
	return json.encode(jrd);
end;

local function GET_either(event)
	local accept_type = event.request.headers.accept or "";
	if ( accept_type:find("xml") or #accept_type ) < ( accept_type:find("json") or #accept_type+1 ) then
		return GET_xml(event);
	else
		return GET_json(event);
	end
end;

module:provides("http", {
	default_path = "/.well-known";
	route = {
		["GET /host-meta"] = GET_either;
		-- ["GET /host-meta.xml"] = GET_xml; -- Hmmm
		["GET /host-meta.json"] = GET_json;
	};
});
