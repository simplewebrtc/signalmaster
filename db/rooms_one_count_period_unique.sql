SELECT
    count(DISTINCT name)::integer as count
FROM
    rooms
WHERE
    rooms.created_at > ${ts}::timestamp with time zone - 1 * interval ${interval};

