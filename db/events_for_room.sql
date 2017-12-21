SELECT *
FROM
  events
WHERE
  events.room_id = ${room_id}
  AND
  (${max_id} IS NULL OR events.id < ${max_id})
  AND
  (${since_id} IS NULL OR events.id > ${since_id})
ORDER BY
  events.created_at ASC
LIMIT ${limit}

