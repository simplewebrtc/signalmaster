select * from rooms where 
name = ${name}
AND (
  ended_at::timestamp > ${created_at}::timestamp with time zone - ${interval} * interval '1 minute' 
  AND
  ended_at::timestamp < ${created_at}::timestamp with time zone
)
order by ended_at desc
limit 1