DELETE FROM rooms WHERE (
    created_at::timestamp < now() - interval ${interval} 
);

