SELECT
  id
FROM
  sessions
WHERE
  id = ${session_id}
FOR UPDATE
