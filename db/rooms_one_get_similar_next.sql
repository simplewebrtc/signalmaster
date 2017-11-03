SELECT * FROM rooms WHERE
  name = ${name}
AND (
  created_at::timestamp < ${ended_at}::timestamp with time zone + ${interval} * interval '1 minute'
  AND
  created_at::timestamp > ${ended_at}::timestamp with time zone
)
ORDER BY ended_at ASC
LIMIT 1
