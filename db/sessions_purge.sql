DELETE FROM sessions WHERE (
    created_at::timestamp < now() - interval ${interval} 
);

