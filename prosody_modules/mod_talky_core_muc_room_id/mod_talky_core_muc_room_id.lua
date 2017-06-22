local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;


local function get_talky_core_id(room)
    return room._data.talky_core_id;
end

local function set_talky_core_id(room, id)
    if not id then
        return false;
    end 

    if get_talky_core_id(room) == id then
        return false;    
    end 

    room._data.talky_core_id = id;

    return true;
end


room_mt.get_talky_core_id = get_talky_core_id;
room_mt.set_talky_core_id = set_talky_core_id;


local function add_form_option(event)
    table.insert(event.form, {
        name = "talky-core#id";
        type = "text-single";
        label = "Room ID";
        value = get_talky_core_id(event.room) or ""; 
    });
end
module:hook("muc-disco#info", add_form_option);


module:log("info", "Loaded mod_talky_core_muc_room_id for %s", module.host);
