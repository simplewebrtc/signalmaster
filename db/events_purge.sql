DELETE FROM events WHERE (
    created_at::timestamp < now() - interval ${interval}
);

