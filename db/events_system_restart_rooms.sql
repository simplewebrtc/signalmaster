INSERT INTO events (type, room_id)
(
  SELECT ${action}, rooms.id  from rooms where ended_at is null
)

