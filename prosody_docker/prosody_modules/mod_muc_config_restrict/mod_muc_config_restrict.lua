local is_admin = require "core.usermanager".is_admin;
local t_remove = table.remove;

local restricted_options = module:get_option_set("muc_config_restricted", {})._items;

function handle_config_submit(event)
	local stanza = event.stanza;
	if is_admin(stanza.attr.from, module.host) then return; end -- Don't restrict admins
	local fields = event.fields;
	for option in restricted_options do
		fields[option] = nil; -- Like it was never there
	end
end

function handle_config_request(event)
	if is_admin(event.actor, module.host) then return; end -- Don't restrict admins
	local form = event.form;
	for i = #form, 1, -1 do
		if restricted_options[form[i].name] then
			t_remove(form, i);
		end
	end
end

module:hook("muc-config-submitted", handle_config_submit);
module:hook("muc-config-form", handle_config_request);
