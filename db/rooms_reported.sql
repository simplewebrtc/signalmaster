SELECT
  *
FROM
  rooms
WHERE
  reports IS NOT NULL
  AND
  reported_at IS NOT NULL
ORDER BY
  reported_at DESC
LIMIT
  ${limit}
OFFSET
  ${offset}
