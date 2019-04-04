SELECT
    count(*)::integer as count,
    type,
    used_turn,
    CASE
      WHEN ended_at IS NULL THEN true
      ELSE false
    END as live,
    CASE
      WHEN age(now(), created_at) < interval '1 day' THEN true
      ELSE false
    END as one_day
FROM
    sessions
WHERE
	age(now(), created_at) < interval '30 days'
  AND
  activated = true
GROUP BY
    live,
    one_day,
    type,
    used_turn;
