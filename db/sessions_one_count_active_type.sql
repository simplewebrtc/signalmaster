SELECT
    count(*)::integer as count
FROM
    sessions
WHERE
    sessions.ended_at IS NULL
    AND
    sessions.activated IS TRUE
    AND
    (${session_type} IS NULL OR sessions.type = ${session_type}::text)
