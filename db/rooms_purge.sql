DELETE FROM rooms WHERE (
    created_at::timestamp < ${now}::timestamp with time zone - ${interval} * interval '1 day'
);

