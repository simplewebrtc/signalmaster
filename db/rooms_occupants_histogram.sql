SELECT
  CASE
    WHEN reports->'occupants'->>'maxConcurrent' = '1' THEN 'equal_1'
    WHEN reports->'occupants'->>'maxConcurrent' = '2' THEN 'equal_2'
    WHEN reports->'occupants'->>'maxConcurrent' = '3' THEN 'equal_3'
    WHEN reports->'occupants'->>'maxConcurrent' = '4' THEN 'equal_4'
    WHEN reports->'occupants'->>'maxConcurrent' = '5' THEN 'equal_5'
    WHEN reports->'occupants'->>'maxConcurrent' = '6' THEN 'equal_6'
    WHEN reports->'occupants'->>'maxConcurrent' = '7' THEN 'equal_7'
    WHEN reports->'occupants'->>'maxConcurrent' = '8' THEN 'equal_8'
    WHEN reports->'occupants'->>'maxConcurrent' = '9' THEN 'equal_9'
    WHEN reports->'occupants'->>'maxConcurrent' = '10' THEN 'equal_10'
    ELSE 'over_10'
  END,
  count(*)
FROM
  rooms
WHERE
  reports IS NOT NULL
  AND
  created_at > ${ts}::timestamp with time zone - 1 * interval ${interval}
  AND
  ((${duration_min} IS NULL OR ${duration_max} IS NULL) OR (
    (ended_at - created_at) BETWEEN ${duration_min} AND ${duration_max}
  ))
GROUP BY 1
