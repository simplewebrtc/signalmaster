select * from rooms where 
name = ${name}
AND
created_at::timestamp < ${ts}::timestamp with time zone + ${lt} * interval '1 minute' 
AND 
created_at::timestamp > ${ts}::timestamp with time zone - ${gt} * interval '1 minute'