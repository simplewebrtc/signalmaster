local uuid_gen = require "util.uuid".generate;


module:hook("muc-room-pre-create", function (event)
    event.room:set_talky_core_id(uuid_gen());
    event.room:set_hidden(true);
end, 10);


module:log("info", "Loaded mod_talky_core_muc_config for %s", module.host);
