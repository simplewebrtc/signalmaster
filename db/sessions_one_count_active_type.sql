SELECT
    count(*)::integer as count
FROM
    sessions
WHERE
    sessions.ended_at IS NULL
    AND
    sessions.type = ${session_type}::text
