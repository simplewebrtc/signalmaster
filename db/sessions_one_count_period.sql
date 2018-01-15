SELECT
    count(*)::integer as count
FROM
    sessions
WHERE
    sessions.created_at > ${ts}::timestamp with time zone - 1 * interval ${interval};
