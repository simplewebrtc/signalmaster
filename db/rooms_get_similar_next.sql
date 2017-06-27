select * from rooms where 
name = ${name}
AND (
  created_at::timestamp < ${ended_at}::timestamp with time zone + ${interval} * interval '1 minute'
  AND
  created_at::timestamp > ${ended_at}::timestamp with time zone
)
limit 1