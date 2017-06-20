local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;


room_mt.get_affiliation = function (room, jid)
    return "owner";
end
