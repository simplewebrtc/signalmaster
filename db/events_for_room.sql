SELECT *
FROM
  events
WHERE
  events.room_id = ${room_id}
ORDER BY
  events.created_at ASC
