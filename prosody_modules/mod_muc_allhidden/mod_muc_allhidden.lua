module:hook("muc-room-pre-create", function (event)
    event.room:set_hidden(true);
end, 10);
