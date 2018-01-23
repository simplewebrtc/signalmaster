SELECT
  CASE
    WHEN ended_at - created_at BETWEEN '0' AND '5s' THEN 'blips'
    WHEN ended_at - created_at BETWEEN '5s' AND '30s' THEN 'under_30_seconds'
    WHEN ended_at - created_at BETWEEN '30s' AND '1min' THEN 'under_1_minute'
    WHEN ended_at - created_at BETWEEN '1min' AND '5min' THEN 'under_5_minutes'
    WHEN ended_at - created_at BETWEEN '5min' AND '10min' THEN 'under_10_minutes'
    WHEN ended_at - created_at BETWEEN '10min' AND '20min' THEN 'under_20_minutes'
    WHEN ended_at - created_at BETWEEN '20min' AND '30min' THEN 'under_30_minutes'
    WHEN ended_at - created_at BETWEEN '30min' AND '45min' THEN 'under_45_minutes'
    WHEN ended_at - created_at BETWEEN '45min' AND '1hr' THEN 'under_1_hour'
    WHEN ended_at - created_at BETWEEN '1hr' AND '2hr' THEN 'under_2_hours'
    WHEN ended_at - created_at BETWEEN '2hr' AND '4hr' THEN 'under_4_hours'
    WHEN ended_at - created_at BETWEEN '4hr' AND '8hr' THEN 'under_8_hours'
    WHEN ended_at - created_at BETWEEN '8hr' AND '12hr' THEN 'under_12_hours'
    WHEN ended_at - created_at BETWEEN '12hr' AND '24hr' THEN 'under_1_day'
    ELSE 'over_1_day'
  END,
  count(*)
FROM
  rooms
WHERE
  created_at > ${ts}::timestamp with time zone - 1 * interval ${interval}
  AND
  (${occupant_count} IS NULL OR (
    reports IS NOT NULL
    AND
    reports->'occupants'->>'maxConcurrent' = ${occupant_count}
  ))
GROUP BY 1
