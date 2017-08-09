INSERT INTO events (type, actor_id)
(
  SELECT ${action}, sessions.id  from sessions where ended_at is null
)
