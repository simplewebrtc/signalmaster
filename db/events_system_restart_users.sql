INSERT INTO events (type, actor_id)
(
  SELECT ${action}, users.id  from users where ended_at is null
)
