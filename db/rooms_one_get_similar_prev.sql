SELECT * FROM rooms WHERE
  name = ${name}
AND (
  ended_at::timestamp > ${created_at}::timestamp with time zone - ${interval} * interval '1 minute'
  AND
  ended_at::timestamp < ${created_at}::timestamp with time zone
)
ORDER BY ended_at DESC
limit 1
