local st = require('util.stanza');

module:add_feature('jabber:iq:version');


module:hook('iq/host/jabber:iq:version:query', function (event)
    local version = module:get_option('talky_core_version');

    local stanza = event.stanza;
    if stanza.attr.type == 'get' and stanza.attr.to == module.host then
        local query = st.stanza('query', { xmlns = 'jabber:iq:version' })
            :tag('name'):text('Talky'):up()
            :tag('version'):text(version):up();

        event.origin.send(st.reply(stanza):add_child(query));
        return true;
    end
end, 10);


module:log("info", "Loaded mod_talky_core_version for %s", module.host);
